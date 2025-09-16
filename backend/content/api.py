# content/api.py
from ninja import NinjaAPI, File, Query
from ninja.router import Router
from ninja.files import UploadedFile
import requests
import os
import tempfile
from typing import Dict, Any, List, Optional
import json
from pydantic import BaseModel
from users.security import jwt_auth
from users.services import debit_credits_for_usage
from django.conf import settings

from .utils import poll_for_transcript
from core.gemini import GeminiService
from dotenv import load_dotenv
load_dotenv()

router = Router()

# Initialize Gemini service
gemini_service = GeminiService(model_name="gemini-1.5-pro", temperature=0.7)


@router.post("/transcribe-audio")
def transcribe_audio(request, audio_file: UploadedFile = File(...)):
    """
    Upload audio file, store it temporarily, and transcribe using Rev.ai
    """
    try:
        # Check if Rev.ai API key is available
        rev_ai_api_key = os.getenv("REV_AI_API_KEY")
        if not rev_ai_api_key:
            return {"error": "Rev.ai API key not configured"}
        
        # Validate file type
        allowed_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.aac']
        file_extension = os.path.splitext(audio_file.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return {
                "error": f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            }
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            for chunk in audio_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name
        
        try:
            # Upload to Rev.ai using the correct API format
            upload_url = "https://api.rev.ai/speechtotext/v1/jobs"
            
            with open(temp_file_path, 'rb') as f:
                files = {'media': (audio_file.name, f, 'audio/mpeg')}
                headers = {
                    'Authorization': f'Bearer {rev_ai_api_key}'
                }
                
                response = requests.post(upload_url, files=files, headers=headers)
                
                if response.status_code != 200:
                    return {
                        "error": f"Rev.ai upload failed: {response.status_code} - {response.text}"
                    }
                
                job_data = response.json()
                job_id = job_data.get('id')
                
                if not job_id:
                    return {"error": "No job ID received from Rev.ai"}
                
                # Poll for completion
                transcript = poll_for_transcript(job_id, rev_ai_api_key)
                
                return {
                    "success": True,
                    "job_id": job_id,
                    "transcript": transcript,
                    "file_name": audio_file.name
                }
                
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}



    
    

    
    





class PromptIn(BaseModel):
    """
    Simple JSON payload to run Gemini.
    """
    prompt: str


@router.post("/gemini-run", auth=jwt_auth)
def run_gemini(request, payload: PromptIn):
    """
    Protected endpoint that runs Gemini and debits user credits based on usage.
    - Requires Authorization: Bearer <access_token>
    - Computes input/output tokens (if available) and charges accordingly.
    - Enforces a minimum debit per call via settings.MIN_CREDIT_DEBIT_PER_CALL.
    """
    try:
        # 1) Invoke Gemini with usage to measure tokens
        content, usage = gemini_service.run_raw_with_usage(payload.prompt)

        # 2) Extract input/output tokens using common keys
        input_tokens = int(usage.get("input_tokens", 0) or usage.get("promptTokenCount", 0) or 0)
        output_tokens = int(usage.get("output_tokens", 0) or usage.get("candidatesTokenCount", 0) or 0)

        # 3) Debit credits based on usage (atomic)
        debited = debit_credits_for_usage(
            user=request.auth,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            min_debit=settings.MIN_CREDIT_DEBIT_PER_CALL,
        )

        return {
            "content": content,
            "usage": {
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
            },
            "debited_credits": debited,
        }
    except ValueError as e:
        # Insufficient credits or similar logical error
        return 402, {"detail": str(e)}
    except Exception as e:
        return 500, {"detail": f"Failed to run model: {e}"}
    
    




