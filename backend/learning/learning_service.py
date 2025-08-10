"""
Learning service for mindmaps, MCQs, and flashcards generation.
"""
import json
from typing import Dict, Any, List, Optional
from ninja.files import UploadedFile
from core.gemini import GeminiService
from constants import (
    MINDMAP_GENERATION_PROMPT, FLASHCARD_GENERATION_PROMPT, get_mcq_quiz_prompt,
    TOPIC_EXTRACTION_PROMPT
)
from schema import (
    MCQQuizStructuredOutput, MCQQuestion, MindmapNode
)
from utils.youtube import is_youtube_url, get_youtube_transcript


class LearningService:
    """Handles learning content generation operations."""

    def __init__(self, gemini_service: GeminiService):
        """
        Initialize the LearningService with a GeminiService instance for content generation.
        """
        self.gemini_service = gemini_service

    def _get_content_from_source(
        self,
        text_input: Optional[str] = None,
        audio_file: Optional[UploadedFile] = None,
        video_file: Optional[UploadedFile] = None,
        document_file: Optional[UploadedFile] = None,
        media_processor=None
    ) -> tuple[str | None, str | None, str | None]:
        """
        Extracts textual content and identifies its source from provided input, which may include text, a YouTube URL, or uploaded media files.
        
        Returns:
            A tuple containing the extracted content (or None), a string indicating the content type ("youtube", "audio", "video", "document", or "text"), and an error message if extraction fails.
        """
        # Check for YouTube URL first
        if text_input and is_youtube_url(text_input):
            transcript, error = get_youtube_transcript(text_input)
            if error:
                return None, "youtube", error
            return transcript, "youtube", None

        # Then check for other inputs
        if audio_file:
            content, error = media_processor.extract_content_from_media(audio_file=audio_file)
            return content, "audio", error
        elif video_file:
            content, error = media_processor.extract_content_from_media(video_file=video_file)
            return content, "video", error
        elif document_file:
            content, error = media_processor.extract_content_from_media(document_file=document_file)
            return content, "document", error
        elif text_input and text_input.strip():
            return text_input, "text", None

        return None, None, "No valid content source provided. Please provide text, a YouTube URL, or a file."

    def generate_mindmap_from_multimedia(
        self,
        topic: Optional[str] = None,
        audio_file: Optional[UploadedFile] = None,
        video_file: Optional[UploadedFile] = None,
        document_file: Optional[UploadedFile] = None,
        media_processor=None
    ) -> Dict[str, Any]:
        """
        Generates a mindmap from multimedia input, including text, YouTube URLs, audio, video, or document files.
        
        Extracts content from the provided sources, determines the topic, and generates a mindmap structure using a language model. Returns a dictionary containing the mindmap, content type, original content, and extracted topic. If content extraction or mindmap generation fails, returns an error message.
        """
        try:
            content, content_type, error = self._get_content_from_source(
                text_input=topic,
                audio_file=audio_file,
                video_file=video_file,
                document_file=document_file,
                media_processor=media_processor
            )
            if error:
                return {"success": False, "error": error}

            extracted_topic = self.gemini_service.run_prompt(TOPIC_EXTRACTION_PROMPT, content)
            extracted_topic = extracted_topic.strip().strip('"').strip("'")
            
            mindmap_json = self.gemini_service.run_prompt(MINDMAP_GENERATION_PROMPT, content)
            mindmap_json = self._clean_json_response(mindmap_json)
            
            mindmap_data = json.loads(mindmap_json)
            return {
                "success": True,
                "mindmap": MindmapNode(**mindmap_data),
                "content_type": content_type,
                "content": content,
                "extracted_topic": extracted_topic
            }
        except json.JSONDecodeError as e:
            return {"success": False, "error": f"Failed to parse mindmap JSON: {str(e)}."}
        except Exception as e:
            return {"success": False, "error": f"Error generating mindmap: {str(e)}"}

    def generate_mcq_quiz_from_multimedia(
        self,
        content: Optional[str] = None,
        num_questions: int = 10,
        audio_file: Optional[UploadedFile] = None,
        video_file: Optional[UploadedFile] = None,
        document_file: Optional[UploadedFile] = None,
        media_processor=None
    ) -> Dict[str, Any]:
        """
        Generate a multiple-choice quiz from provided content or multimedia sources.
        
        Extracts textual content from a text input, YouTube URL, or uploaded audio, video, or document file, then generates a set of MCQ questions using a language model. Returns the quiz questions, content type, and original content, or an error message if generation fails.
        
        Parameters:
            content (str, optional): Text input or YouTube URL to extract content from.
            num_questions (int): Number of MCQ questions to generate.
        
        Returns:
            dict: A dictionary containing the success status, generated quiz questions, content type, original content, or an error message.
        """
        try:
            content_text, content_type, error = self._get_content_from_source(
                text_input=content,
                audio_file=audio_file,
                video_file=video_file,
                document_file=document_file,
                media_processor=media_processor
            )
            if error:
                return {"success": False, "error": error}

            structured_llm = self.gemini_service.llm.with_structured_output(MCQQuizStructuredOutput)
            prompt = get_mcq_quiz_prompt(content_text, num_questions)
            result = structured_llm.invoke(prompt)

            questions = [MCQQuestion(**q.dict()) for q in result.questions]
            
            return {
                "success": True,
                "quiz": questions,
                "content_type": content_type,
                "content": content_text
            }
        except Exception as e:
            return {"success": False, "error": f"Error generating MCQ quiz: {str(e)}"}

    def generate_flashcards_from_multimedia(
        self,
        content: Optional[str] = None,
        audio_file: Optional[UploadedFile] = None,
        video_file: Optional[UploadedFile] = None,
        document_file: Optional[UploadedFile] = None,
        media_processor=None
    ) -> Dict[str, Any]:
        """
        Generate flashcards from provided text, YouTube URL, or uploaded audio, video, or document files.
        
        Extracts content from the specified input source, generates flashcards using a language model prompt, and returns the flashcards data along with metadata. Handles content extraction errors and JSON parsing failures.
        
        Returns:
            dict: A dictionary containing the success status, flashcards data, total number of cards, content type, and original content, or an error message if generation fails.
        """
        try:
            content_text, content_type, error = self._get_content_from_source(
                text_input=content,
                audio_file=audio_file,
                video_file=video_file,
                document_file=document_file,
                media_processor=media_processor
            )
            if error:
                return {"success": False, "error": error}

            flashcards_json = self.gemini_service.run_prompt(FLASHCARD_GENERATION_PROMPT, content_text)
            flashcards_json = self._clean_json_response(flashcards_json)
            
            flashcards_data = json.loads(flashcards_json)
            return {
                "success": True,
                "flashcards": flashcards_data,
                "total_cards": len(flashcards_data),
                "content_type": content_type,
                "content": content_text
            }
        except json.JSONDecodeError as e:
            return {"success": False, "error": f"Failed to parse flashcards JSON: {str(e)}."}
        except Exception as e:
            return {"success": False, "error": f"Error generating flashcards: {str(e)}"}

    def _clean_json_response(self, response: str) -> str:
        """
        Clean and normalize JSON responses from the language model by removing code block markers and extraneous whitespace.
        
        Parameters:
            response (str): The raw JSON response string from the language model.
        
        Returns:
            str: The cleaned JSON string, ready for parsing.
        """
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        return response.strip()
    
    def generate_mindmap(self, topic: str) -> Dict[str, Any]:
        """
        Generate a mindmap structure for the specified topic.
        
        Runs a prompt to produce a mindmap in JSON format, cleans and parses the response, and returns the result as a MindmapNode object.
        
        Returns:
            dict: Contains a success flag and the generated mindmap data, or an error message if generation or parsing fails.
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