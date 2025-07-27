"""
Learning service for mindmaps, MCQs, and flashcards generation.
"""
import json
from typing import Dict, Any, List, Optional
from ninja.files import UploadedFile
from core.gemini import GeminiService
from constants import (
    MINDMAP_GENERATION_PROMPT, FLASHCARD_GENERATION_PROMPT, get_mcq_quiz_prompt
)
from schema import (
    MCQQuizStructuredOutput, MCQQuestion, MindmapNode
)


class LearningService:
    """Handles learning content generation operations."""
    
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service
    
    def generate_mindmap_from_multimedia(
        self, 
        topic: Optional[str] = None,
        youtube_url: Optional[str] = None,
        audio_file: Optional[UploadedFile] = None, 
        video_file: Optional[UploadedFile] = None,
        document_file: Optional[UploadedFile] = None,
        media_processor=None
    ) -> Dict[str, Any]:
        """
        Generate mindmap from multimedia content (audio/video/document) or topic.
        
        Returns:
            Dict with success status and mindmap data or error message
        """
        try:
            # Determine content source
            if audio_file:
                content, error = media_processor.extract_content_from_media(audio_file=audio_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "audio"
            elif video_file:
                content, error = media_processor.extract_content_from_media(video_file=video_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "video"
            elif document_file:
                content, error = media_processor.extract_content_from_media(document_file=document_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "document"
            elif youtube_url:
                content, error = media_processor.extract_content_from_youtube(youtube_url)
                if error:
                    return {"success": False, "error": error}
                content_type = "youtube"
            elif topic and topic.strip():
                content = topic
                content_type = "text"
            else:
                return {"success": False, "error": "Either topic, YouTube URL, audio file, video file, or document file must be provided"}
            
            # Generate mindmap
            mindmap_json = self.gemini_service.run_prompt(MINDMAP_GENERATION_PROMPT, content)
            
            # Clean the response - remove any leading/trailing whitespace and common prefixes
            mindmap_json = mindmap_json.strip()
            
            # Remove common prefixes that LLMs sometimes add
            if mindmap_json.startswith("```json"):
                mindmap_json = mindmap_json[7:]
            if mindmap_json.startswith("```"):
                mindmap_json = mindmap_json[3:]
            if mindmap_json.endswith("```"):
                mindmap_json = mindmap_json[:-3]
            
            mindmap_json = mindmap_json.strip()
            
            # Parse and validate JSON
            mindmap_data = json.loads(mindmap_json)
            return {
                "success": True,
                "mindmap": MindmapNode(**mindmap_data),
                "content_type": content_type,
                "content": content
            }
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse mindmap JSON: {str(e)}. Raw response: {mindmap_json[:200]}..."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating mindmap: {str(e)}"
            }
    
    def generate_mcq_quiz_from_multimedia(
        self, 
        content: Optional[str] = None, 
        num_questions: int = 10,
        youtube_url: Optional[str] = None,
        audio_file: Optional[UploadedFile] = None, 
        video_file: Optional[UploadedFile] = None,
        document_file: Optional[UploadedFile] = None,
        media_processor=None
    ) -> Dict[str, Any]:
        """
        Generate MCQ quiz from multimedia content (audio/video/document) or text.
        
        Returns:
            Dict with success status and quiz data or error message
        """
        try:
            # Determine content source
            if audio_file:
                content_text, error = media_processor.extract_content_from_media(audio_file=audio_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "audio"
            elif video_file:
                content_text, error = media_processor.extract_content_from_media(video_file=video_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "video"
            elif document_file:
                content_text, error = media_processor.extract_content_from_media(document_file=document_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "document"
            elif youtube_url:
                content_text, error = media_processor.extract_content_from_youtube(youtube_url)
                if error:
                    return {"success": False, "error": error}
                content_type = "youtube"
            elif content and content.strip():
                content_text = content
                content_type = "text"
            else:
                return {"success": False, "error": "Either content, YouTube URL, audio file, video file, or document file must be provided"}
            
            # Use structured output for MCQ generation
            structured_llm = self.gemini_service.llm.with_structured_output(MCQQuizStructuredOutput)
            
            # Create a simple prompt for structured output
            simple_prompt = f"""
            Based on the following content, create {num_questions} multiple choice questions.
            
            Content: {content_text}
            
            Create questions that are:
            - Clear and relevant to the content
            - Have plausible options with only one correct answer
            - Include helpful explanations
            - Cover different aspects of the content
            """
            
            result = structured_llm.invoke(simple_prompt)
            
            # Convert structured output to the expected format
            questions = []
            for q in result.questions:
                questions.append(MCQQuestion(
                    question=q.question,
                    options=[q.option_a, q.option_b, q.option_c, q.option_d],
                    correct_answer=q.correct_answer,
                    explanation=q.explanation
                ))
            
            return {
                "success": True,
                "quiz": questions,
                "content_type": content_type,
                "content": content_text
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating MCQ quiz: {str(e)}"
            }
    
    def generate_flashcards_from_multimedia(
        self, 
        content: Optional[str] = None,
        youtube_url: Optional[str] = None,
        audio_file: Optional[UploadedFile] = None, 
        video_file: Optional[UploadedFile] = None,
        document_file: Optional[UploadedFile] = None,
        media_processor=None
    ) -> Dict[str, Any]:
        """
        Generate flashcards from multimedia content (audio/video/document) or text.
        
        Returns:
            Dict with success status and flashcards data or error message
        """
        try:
            # Determine content source
            if audio_file:
                content_text, error = media_processor.extract_content_from_media(audio_file=audio_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "audio"
            elif video_file:
                content_text, error = media_processor.extract_content_from_media(video_file=video_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "video"
            elif document_file:
                content_text, error = media_processor.extract_content_from_media(document_file=document_file)
                if error:
                    return {"success": False, "error": error}
                content_type = "document"
            elif youtube_url:
                content_text, error = media_processor.extract_content_from_youtube(youtube_url)
                if error:
                    return {"success": False, "error": error}
                content_type = "youtube"
            elif content and content.strip():
                content_text = content
                content_type = "text"
            else:
                return {"success": False, "error": "Either content, YouTube URL, audio file, video file, or document file must be provided"}
            
            flashcards_json = self.gemini_service.run_prompt(FLASHCARD_GENERATION_PROMPT, content_text)
            
            # Clean the response - remove any leading/trailing whitespace and common prefixes
            flashcards_json = flashcards_json.strip()
            
            # Remove common prefixes that LLMs sometimes add
            if flashcards_json.startswith("```json"):
                flashcards_json = flashcards_json[7:]
            if flashcards_json.startswith("```"):
                flashcards_json = flashcards_json[3:]
            if flashcards_json.endswith("```"):
                flashcards_json = flashcards_json[:-3]
            
            flashcards_json = flashcards_json.strip()
            
            # Parse and validate JSON
            flashcards_data = json.loads(flashcards_json)
            return {
                "success": True,
                "flashcards": flashcards_data,
                "total_cards": len(flashcards_data),
                "content_type": content_type,
                "content": content_text
            }
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse flashcards JSON: {str(e)}. Raw response: {flashcards_json[:200]}..."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating flashcards: {str(e)}"
            }
    
    def generate_mindmap(self, topic: str) -> Dict[str, Any]:
        """
        Generate mindmap JSON structure for a given topic.
        
        Returns:
            Dict with success status and mindmap data or error message
        """
        try:
            mindmap_json = self.gemini_service.run_prompt(MINDMAP_GENERATION_PROMPT, topic)
            
            # Clean the response - remove any leading/trailing whitespace and common prefixes
            mindmap_json = mindmap_json.strip()
            
            # Remove common prefixes that LLMs sometimes add
            if mindmap_json.startswith("```json"):
                mindmap_json = mindmap_json[7:]
            if mindmap_json.startswith("```"):
                mindmap_json = mindmap_json[3:]
            if mindmap_json.endswith("```"):
                mindmap_json = mindmap_json[:-3]
            
            mindmap_json = mindmap_json.strip()
            
            # Parse and validate JSON
            mindmap_data = json.loads(mindmap_json)
            return {
                "success": True,
                "mindmap": MindmapNode(**mindmap_data)
            }
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse mindmap JSON: {str(e)}. Raw response: {mindmap_json[:200]}..."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating mindmap: {str(e)}"
            }
    
    def generate_mcq_quiz(self, content: str, num_questions: int) -> Dict[str, Any]:
        """
        Generate MCQ quiz questions using structured output.
        
        Returns:
            Dict with success status and quiz data or error message
        """
        try:
            # Use structured output for MCQ generation
            structured_llm = self.gemini_service.llm.with_structured_output(MCQQuizStructuredOutput)
            
            # Create a simple prompt for structured output
            simple_prompt = f"""
            Based on the following content, create {num_questions} multiple choice questions.
            
            Content: {content}
            
            Create questions that are:
            - Clear and relevant to the content
            - Have plausible options with only one correct answer
            - Include helpful explanations
            - Cover different aspects of the content
            """
            
            result = structured_llm.invoke(simple_prompt)
            
            # Convert structured output to the expected format
            questions = []
            for q in result.questions:
                questions.append(MCQQuestion(
                    question=q.question,
                    options=[q.option_a, q.option_b, q.option_c, q.option_d],
                    correct_answer=q.correct_answer,
                    explanation=q.explanation
                ))
            
            return {
                "success": True,
                "quiz": questions
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating MCQ quiz: {str(e)}"
            }
    
    def generate_flashcards(self, content: str) -> Dict[str, Any]:
        """
        Generate flashcards for the given content.
        
        Returns:
            Dict with success status and flashcards data or error message
        """
        try:
            flashcards_json = self.gemini_service.run_prompt(FLASHCARD_GENERATION_PROMPT, content)
            
            # Clean the response - remove any leading/trailing whitespace and common prefixes
            flashcards_json = flashcards_json.strip()
            
            # Remove common prefixes that LLMs sometimes add
            if flashcards_json.startswith("```json"):
                flashcards_json = flashcards_json[7:]
            if flashcards_json.startswith("```"):
                flashcards_json = flashcards_json[3:]
            if flashcards_json.endswith("```"):
                flashcards_json = flashcards_json[:-3]
            
            flashcards_json = flashcards_json.strip()
            
            # Parse and validate JSON
            flashcards_data = json.loads(flashcards_json)
            return {
                "success": True,
                "flashcards": flashcards_data,
                "total_cards": len(flashcards_data)
            }
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse flashcards JSON: {str(e)}. Raw response: {flashcards_json[:200]}..."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error generating flashcards: {str(e)}"
            } 