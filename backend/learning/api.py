# learning/api.py
from ninja import NinjaAPI, File
from ninja.router import Router
from ninja.files import UploadedFile
from ninja import Query
from typing import Optional
from dotenv import load_dotenv

# Core imports
from core.gemini import GeminiService

# Service imports
from .learning_service import LearningService
from utils.media_processor import MediaProcessor

# Schema imports
from schema import (
    SummarizeTextInput, SummarizeTextOutput,
    MindmapInput, MindmapOutput, MindmapMultimediaInput,
    MCQQuizInput, MCQQuizOutput, MCQQuizMultimediaInput,
    FlashcardInput, FlashcardOutput, FlashcardMultimediaInput,
    SuccessResponse
)

# Constants
from constants import TEXT_SUMMARIZATION_PROMPT

load_dotenv()

router = Router()

# Initialize services
gemini_service = GeminiService(model_name="gemini-2.5-flash", temperature=0.7)
media_processor = MediaProcessor(gemini_service)
learning_service = LearningService(gemini_service)


@router.get("/hello", response=SuccessResponse)
def hello(request):
    """Simple health check endpoint."""
    return {"success": True, "message": "Hello from Learnable AI!"}


@router.post("/summarize-content")
def summarize_content(
    request, 
    data: Optional[SummarizeTextInput] = None, 
    audio_file: Optional[UploadedFile] = File(None), 
    video_file: Optional[UploadedFile] = File(None),
    document_file: Optional[UploadedFile] = File(None)
):
    """
    Summarize content using Gemini API - accepts text, audio, video, document files, and YouTube URLs
    """
    try:
        content_type = None
        content_text = ""
        summary = None
        # Handle text input
        if data and data.text:
            content_type = "text"
            content_text = data.text
            summary, error = media_processor.summarize_text(data.text)
            if error:
                return {"error": error}
        # Handle YouTube URL
        elif data and hasattr(data, "youtubeUrl") and data.youtubeUrl:
            content_type = "youtube"
            summary, error = media_processor.process_youtube_url(data.youtubeUrl)
            if error:
                return {"error": error}
        # Handle audio input
        elif audio_file:
            content_type = "audio"
            summary, error = media_processor.process_audio_file(audio_file)
            if error:
                return {"error": error}
        # Handle video input
        elif video_file:
            content_type = "video"
            summary, error = media_processor.process_video_file(video_file)
            if error:
                return {"error": error}
        # Handle document input
        elif document_file:
            content_type = "document"
            summary, error = media_processor.process_document_file(document_file)
            if error:
                return {"error": error}
        else:
            return {"error": "Either text content, YouTube URL, audio file, video file, or document file must be provided"}
        # Determine original text for response
        if content_type == "text":
            original_text = content_text
            word_count_original = len(content_text.split())
        else:
            file_name = (
                audio_file.name if content_type == "audio" else
                video_file.name if content_type == "video" else
                document_file.name if content_type == "document" else ""
            )
            original_text = f"{content_type.capitalize()} file: {file_name}"
            word_count_original = 0
        return SummarizeTextOutput(
            success=True,
            original_text=original_text,
            summary=summary,
            word_count_original=word_count_original,
            word_count_summary=len(summary.split()),
            content_type=content_type
        )
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.post("/summarize-text")
def summarize_text(request, data: SummarizeTextInput):
    """
    Summarize text using Gemini API (legacy endpoint)
    """
    try:
        summary = gemini_service.run_prompt(TEXT_SUMMARIZATION_PROMPT, data.text)
        
        return SummarizeTextOutput(
            success=True,
            original_text=data.text,
            summary=summary,
            word_count_original=len(data.text.split()),
            word_count_summary=len(summary.split())
        )
        
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.post("/generate-mindmap")
def generate_mindmap(request, data: MindmapInput):
    """
    Generate mindmap JSON structure for D3.js visualization (text only)
    """
    try:
        result = learning_service.generate_mindmap(data.topic)
        
        if result["success"]:
            return MindmapOutput(
                success=True,
                topic=data.topic,
                mindmap=result["mindmap"]
            )
        else:
            return {"error": result["error"]}
        
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.post("/generate-mindmap-multimedia")
def generate_mindmap_multimedia(
    request, 
    data: Optional[MindmapMultimediaInput] = None, 
    audio_file: Optional[UploadedFile] = File(None), 
    video_file: Optional[UploadedFile] = File(None),
    document_file: Optional[UploadedFile] = File(None)
):
    """
    Generate mindmap JSON structure from multimedia content (text, audio, video, document, or YouTube)
    """
    try:
        topic = data.topic if data else None
        youtube_url = data.youtubeUrl if data and hasattr(data, "youtubeUrl") else None
        result = learning_service.generate_mindmap_from_multimedia(
            topic=topic,
            youtube_url=youtube_url,
            audio_file=audio_file,
            video_file=video_file,
            document_file=document_file,
            media_processor=media_processor
        )
        if result["success"]:
            return MindmapOutput(
                success=True,
                topic=result.get("content", topic or "Multimedia Content"),
                mindmap=result["mindmap"],
                content_type=result.get("content_type")
            )
        else:
            return {"error": result["error"]}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.post("/generate-mcq-quiz")
def generate_mcq_quiz(request, data: MCQQuizInput):
    """
    Generate MCQ quiz questions using Gemini API with structured output (text only)
    """
    try:
        result = learning_service.generate_mcq_quiz(data.content, data.num_questions)
        
        if result["success"]:
            return MCQQuizOutput(
                success=True,
                content=data.content,
                num_questions=data.num_questions,
                quiz=result["quiz"]
            )
        else:
            return {"error": result["error"]}
        
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.post("/generate-mcq-quiz-multimedia")
def generate_mcq_quiz_multimedia(
    request, 
    data: Optional[MCQQuizMultimediaInput] = None, 
    audio_file: Optional[UploadedFile] = File(None), 
    video_file: Optional[UploadedFile] = File(None),
    document_file: Optional[UploadedFile] = File(None)
):
    """
    Generate MCQ quiz questions from multimedia content (text, audio, video, document, or YouTube)
    """
    try:
        content = data.content if data else None
        num_questions = data.num_questions if data else 10
        youtube_url = data.youtubeUrl if data and hasattr(data, "youtubeUrl") else None
        result = learning_service.generate_mcq_quiz_from_multimedia(
            content=content,
            num_questions=num_questions,
            youtube_url=youtube_url,
            audio_file=audio_file,
            video_file=video_file,
            document_file=document_file,
            media_processor=media_processor
        )
        if result["success"]:
            return MCQQuizOutput(
                success=True,
                content=result["content"],
                num_questions=num_questions,
                quiz=result["quiz"],
                content_type=result.get("content_type")
            )
        else:
            return {"error": result["error"]}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.post("/generate-flashcards")
def generate_flashcards(request, data: FlashcardInput):
    """
    Generate flashcards with structured output (text only)
    """
    try:
        result = learning_service.generate_flashcards(data.content)
        
        if result["success"]:
            return FlashcardOutput(
                success=True,
                content=data.content,
                flashcards=result["flashcards"],
                total_cards=result["total_cards"]
            )
        else:
            return {"error": result["error"]}
        
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.post("/generate-flashcards-multimedia")
def generate_flashcards_multimedia(
    request, 
    data: Optional[FlashcardMultimediaInput] = None, 
    audio_file: Optional[UploadedFile] = File(None), 
    video_file: Optional[UploadedFile] = File(None),
    document_file: Optional[UploadedFile] = File(None)
):
    """
    Generate flashcards from multimedia content (text, audio, video, document, or YouTube)
    """
    try:
        content = data.content if data else None
        youtube_url = data.youtubeUrl if data and hasattr(data, "youtubeUrl") else None
        result = learning_service.generate_flashcards_from_multimedia(
            content=content,
            youtube_url=youtube_url,
            audio_file=audio_file,
            video_file=video_file,
            document_file=document_file,
            media_processor=media_processor
        )
        if result["success"]:
            return FlashcardOutput(
                success=True,
                content=result["content"],
                flashcards=result["flashcards"],
                total_cards=result["total_cards"],
                content_type=result.get("content_type")
            )
        else:
            return {"error": result["error"]}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@router.get("/generate-mcq-quiz-query")
def generate_mcq_quiz_query(
    request, 
    content: str = Query(..., description="Content to generate quiz from"), 
    num_questions: int = Query(10, description="Number of questions (1-50)")
):
    """
    Generate MCQ quiz questions using query parameters
    """
    try:
        if not content:
            return {"error": "Content is required"}
        
        if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 50:
            num_questions = 10
        
        result = learning_service.generate_mcq_quiz(content, num_questions)
        
        if result["success"]:
            return MCQQuizOutput(
                success=True,
                content=content,
                num_questions=num_questions,
                quiz=result["quiz"]
            )
        else:
            return {"error": result["error"]}
        
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


