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
from utils.youtube import is_youtube_url, get_youtube_transcript

# Schema imports
from schema import (
    SummarizeTextInput, SummarizeTextOutput, SummarizeContentInput,
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
    data: Optional[SummarizeContentInput] = None, 
    audio_file: Optional[UploadedFile] = File(None), 
    video_file: Optional[UploadedFile] = File(None),
    document_file: Optional[UploadedFile] = File(None)
):
    """
    Summarizes input content, supporting plain text, YouTube URLs, audio, video, and document files.
    
    Accepts either direct text input (including YouTube URLs) or uploaded media files. For YouTube URLs, retrieves and summarizes the transcript. For other media types, processes the file to generate a summary. Returns the summary, original content reference, word counts, and content type. If input is missing or processing fails, returns an error message.
    """
    try:
        content_type = None
        summary = None
        original_text = ""
        word_count_original = 0
        
        # Handle text or YouTube URL input
        if data and data.text:
            if is_youtube_url(data.text):
                content_type = "youtube"
                original_text = data.text
                transcript, error = get_youtube_transcript(data.text)
                if error:
                    return {"error": error}
                summary, error = media_processor.summarize_text(transcript)
                if error:
                    return {"error": error}
                word_count_original = len(transcript.split())
            else:
                content_type = "text"
                original_text = data.text
                summary, error = media_processor.summarize_text(data.text)
                if error:
                    return {"error": error}
                word_count_original = len(data.text.split())

        # Handle audio input
        elif audio_file:
            content_type = "audio"
            original_text = f"Audio file: {audio_file.name}"
            summary, error = media_processor.process_audio_file(audio_file)
            if error:
                return {"error": error}
            # Word count for audio is handled inside process_audio_file or can be omitted

        # Handle video input
        elif video_file:
            content_type = "video"
            original_text = f"Video file: {video_file.name}"
            summary, error = media_processor.process_video_file(video_file)
            if error:
                return {"error": error}

        # Handle document input
        elif document_file:
            content_type = "document"
            original_text = f"Document file: {document_file.name}"
            summary, error = media_processor.process_document_file(document_file)
            if error:
                return {"error": error}
        else:
            return {"error": "No content provided. Please enter text, a YouTube URL, or upload a file."}
        
        if summary:
            word_count_summary = len(summary.split())
            return SummarizeTextOutput(
                success=True,
                original_text=original_text,
                summary=summary,
                word_count_original=word_count_original,
                word_count_summary=word_count_summary,
                content_type=content_type
            )
        else:
            return {"error": "Failed to generate summary"}
            
    except Exception as e:
        print(f"Error in summarize_content: {str(e)}")
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
            word_count_summary=len(summary.split()),
            content_type="text"
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
    Generate mindmap JSON structure from multimedia content (text, audio, video, or document)
    """
    try:
        topic = data.topic if data else None
        
        # Log file information for debugging
        if audio_file:
            print(f"Processing audio file for mindmap: {audio_file.name}, size: {audio_file.size}")
        elif video_file:
            print(f"Processing video file for mindmap: {video_file.name}, size: {video_file.size}")
        elif document_file:
            print(f"Processing document file for mindmap: {document_file.name}, size: {document_file.size}")
        
        result = learning_service.generate_mindmap_from_multimedia(
            topic=topic,
            audio_file=audio_file,
            video_file=video_file,
            document_file=document_file,
            media_processor=media_processor
        )
        if result["success"]:
            # Use extracted topic as the main topic for the mindmap
            final_topic = result.get("extracted_topic", result.get("content", topic or "Multimedia Content"))
            return MindmapOutput(
                success=True,
                topic=final_topic,
                mindmap=result["mindmap"],
                content_type=result.get("content_type")
            )
        else:
            return {"error": result["error"]}
    except Exception as e:
        print(f"Error in generate_mindmap_multimedia: {str(e)}")
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
    Generate MCQ quiz questions from multimedia content (text, audio, video, or document)
    """
    try:
        content = data.content if data else None
        num_questions = data.num_questions if data else 10
        result = learning_service.generate_mcq_quiz_from_multimedia(
            content=content,
            num_questions=num_questions,
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
    Generate flashcards from multimedia content (text, audio, video, or document)
    """
    try:
        content = data.content if data else None
        result = learning_service.generate_flashcards_from_multimedia(
            content=content,
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


