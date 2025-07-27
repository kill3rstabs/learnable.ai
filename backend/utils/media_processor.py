"""
Media processing utilities for audio, video, document transcription/summarization,
and YouTube video processing.
"""
import os
import re
import tempfile
import base64
import requests
from typing import Tuple, Optional, Dict, Any, List
from ninja.files import UploadedFile
from langchain_core.messages import SystemMessage, HumanMessage
from core.gemini import GeminiService
from constants import (
    ALLOWED_AUDIO_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS, ALLOWED_DOCUMENT_EXTENSIONS,
    TRANSCRIBER_SYSTEM_MESSAGE, SUMMARIZER_SYSTEM_MESSAGE,
    STRUCTURED_SUMMARY_FORMAT, AUDIO_TRANSCRIPTION_PROMPT, VIDEO_TRANSCRIPTION_PROMPT
)
import PyPDF2
import docx

try:
    from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
    YOUTUBE_API_AVAILABLE = True
except ImportError:
    YOUTUBE_API_AVAILABLE = False


class MediaProcessor:
    """Handles media file processing including transcription and summarization."""
    
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service
    
    def validate_audio_file(self, audio_file: UploadedFile) -> Tuple[bool, str]:
        """Validate audio file format."""
        file_extension = os.path.splitext(audio_file.name)[1].lower()
        if file_extension not in ALLOWED_AUDIO_EXTENSIONS:
            return False, f"Unsupported audio format. Allowed: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        return True, file_extension
    
    def validate_video_file(self, video_file: UploadedFile) -> Tuple[bool, str]:
        """Validate video file format."""
        file_extension = os.path.splitext(video_file.name)[1].lower()
        if file_extension not in ALLOWED_VIDEO_EXTENSIONS:
            return False, f"Unsupported video format. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        return True, file_extension
    
    def validate_document_file(self, document_file: UploadedFile) -> Tuple[bool, str]:
        """Validate document file format (PDF, Word)."""
        file_extension = os.path.splitext(document_file.name)[1].lower()
        if file_extension not in ALLOWED_DOCUMENT_EXTENSIONS:
            return False, f"Unsupported document format. Allowed: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}"
        return True, file_extension

    def _save_uploaded_file(self, uploaded_file: UploadedFile, suffix: str) -> str:
        """Save uploaded file to temporary location and return file path."""
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            return temp_file.name
    
    def _encode_file_to_base64(self, file_path: str) -> str:
        """Encode file to base64 string."""
        with open(file_path, 'rb') as f:
            file_data = f.read()
            return base64.b64encode(file_data).decode('utf-8')
    
    def _create_transcription_message(self, base64_data: str, mime_type: str, prompt: str) -> list:
        """Create transcription message for Gemini."""
        return [
            SystemMessage(content=TRANSCRIBER_SYSTEM_MESSAGE),
            HumanMessage(content=[
                {"type": "text", "text": prompt},
                {
                    "type": "media",
                    "data": base64_data,
                    "mime_type": mime_type
                }
            ])
        ]
    
    def _create_summary_message(self, transcription: str) -> list:
        """Create summary message for Gemini."""
        return [
            SystemMessage(content=SUMMARIZER_SYSTEM_MESSAGE),
            HumanMessage(content=STRUCTURED_SUMMARY_FORMAT.format(content=transcription))
        ]
    
    def process_audio_file(self, audio_file: UploadedFile) -> Tuple[str, Optional[str]]:
        """
        Process audio file: transcribe and then summarize.
        
        Returns:
            Tuple of (summary, error_message)
        """
        # Validate file
        is_valid, file_extension = self.validate_audio_file(audio_file)
        if not is_valid:
            return None, file_extension
        
        # Save file temporarily
        temp_file_path = self._save_uploaded_file(audio_file, file_extension)
        
        try:
            # Encode to base64
            audio_base64 = self._encode_file_to_base64(temp_file_path)
            
            # Step 1: Transcribe
            transcription_message = self._create_transcription_message(
                audio_base64, f"audio/{file_extension[1:]}", AUDIO_TRANSCRIPTION_PROMPT
            )
            transcription = self.gemini_service.llm.invoke(transcription_message).content
            
            # Step 2: Summarize
            summary_message = self._create_summary_message(transcription)
            summary = self.gemini_service.llm.invoke(summary_message).content
            
            return summary, None
            
        except Exception as e:
            return None, f"Error processing audio file: {str(e)}"
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    def process_video_file(self, video_file: UploadedFile) -> Tuple[str, Optional[str]]:
        """
        Process video file: transcribe and then summarize.
        
        Returns:
            Tuple of (summary, error_message)
        """
        # Validate file
        is_valid, file_extension = self.validate_video_file(video_file)
        if not is_valid:
            return None, file_extension
        
        # Save file temporarily
        temp_file_path = self._save_uploaded_file(video_file, file_extension)
        
        try:
            # Encode to base64
            video_base64 = self._encode_file_to_base64(temp_file_path)
            
            # Step 1: Transcribe
            transcription_message = self._create_transcription_message(
                video_base64, f"video/{file_extension[1:]}", VIDEO_TRANSCRIPTION_PROMPT
            )
            transcription = self.gemini_service.llm.invoke(transcription_message).content
            
            # Step 2: Summarize
            summary_message = self._create_summary_message(transcription)
            summary = self.gemini_service.llm.invoke(summary_message).content
            
            return summary, None
            
        except Exception as e:
            return None, f"Error processing video file: {str(e)}"
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    def process_document_file(self, document_file: UploadedFile) -> Tuple[str, Optional[str]]:
        """
        Process document file: extract text and summarize.
        Returns: Tuple of (summary, error_message)
        """
        is_valid, file_extension = self.validate_document_file(document_file)
        if not is_valid:
            return None, file_extension
        temp_file_path = self._save_uploaded_file(document_file, file_extension)
        try:
            text = self._extract_text_from_document(temp_file_path, file_extension)
            if not text:
                return None, "Failed to extract text from document."
            summary_message = self._create_summary_message(text)
            summary = self.gemini_service.llm.invoke(summary_message).content
            return summary, None
        except Exception as e:
            return None, f"Error processing document file: {str(e)}"
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    def _extract_text_from_document(self, file_path: str, file_extension: str) -> str:
        """Extract text from PDF or Word document."""
        if file_extension == '.pdf':
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = "\n".join(page.extract_text() or '' for page in reader.pages)
            return text
        elif file_extension in ['.docx', '.doc']:
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        return ""

    def summarize_text(self, text: str) -> Tuple[str, Optional[str]]:
        """
        Summarize text content.
        
        Returns:
            Tuple of (summary, error_message)
        """
        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            input_message = [
                SystemMessage(content="You are a professional summarizer who creates concise, well-structured summaries. Focus on extracting key insights and main points."),
                HumanMessage(content=text)
            ]
            summary = self.gemini_service.llm.invoke(input_message).content
            return summary, None
        except Exception as e:
            return None, f"Error summarizing text: {str(e)}" 
    
    def extract_content_from_media(self, audio_file=None, video_file=None, document_file=None) -> Tuple[str, Optional[str]]:
        """
        Extract content from audio, video, or document file for use in learning services.
        Returns: Tuple of (content, error_message)
        """
        if audio_file:
            return self._extract_content_from_audio(audio_file)
        elif video_file:
            return self._extract_content_from_video(video_file)
        elif document_file:
            return self._extract_content_from_document(document_file)
        else:
            return None, "No audio, video, or document file provided"
    
    def _extract_content_from_audio(self, audio_file) -> Tuple[str, Optional[str]]:
        """Extract content from audio file."""
        # Validate file
        is_valid, file_extension = self.validate_audio_file(audio_file)
        if not is_valid:
            return None, file_extension
        
        # Save file temporarily
        temp_file_path = self._save_uploaded_file(audio_file, file_extension)
        
        try:
            # Encode to base64
            audio_base64 = self._encode_file_to_base64(temp_file_path)
            
            # Transcribe audio
            transcription_message = self._create_transcription_message(
                audio_base64, f"audio/{file_extension[1:]}", AUDIO_TRANSCRIPTION_PROMPT
            )
            content = self.gemini_service.llm.invoke(transcription_message).content
            
            return content, None
            
        except Exception as e:
            return None, f"Error extracting content from audio file: {str(e)}"
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    def _extract_content_from_video(self, video_file) -> Tuple[str, Optional[str]]:
        """Extract content from video file."""
        # Validate file
        is_valid, file_extension = self.validate_video_file(video_file)
        if not is_valid:
            return None, file_extension
        
        # Save file temporarily
        temp_file_path = self._save_uploaded_file(video_file, file_extension)
        
        try:
            # Encode to base64
            video_base64 = self._encode_file_to_base64(temp_file_path)
            
            # Transcribe video
            transcription_message = self._create_transcription_message(
                video_base64, f"video/{file_extension[1:]}", VIDEO_TRANSCRIPTION_PROMPT
            )
            content = self.gemini_service.llm.invoke(transcription_message).content
            
            return content, None
            
        except Exception as e:
            return None, f"Error extracting content from video file: {str(e)}"
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    def _extract_content_from_document(self, document_file) -> Tuple[str, Optional[str]]:
        """Extract content from document file."""
        is_valid, file_extension = self.validate_document_file(document_file)
        if not is_valid:
            return None, file_extension
        temp_file_path = self._save_uploaded_file(document_file, file_extension)
        try:
            text = self._extract_text_from_document(temp_file_path, file_extension)
            if not text:
                return None, "Failed to extract text from document."
            return text, None
        except Exception as e:
            return None, f"Error extracting content from document file: {str(e)}"
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path) 
                
    def process_youtube_url(self, youtube_url: str) -> Tuple[str, Optional[str]]:
        """
        Process YouTube URL: get transcript and summarize.
        
        Returns:
            Tuple of (summary, error_message)
        """
        try:
            if not YOUTUBE_API_AVAILABLE:
                return None, "YouTube transcript API not available. Please install 'youtube_transcript_api' package."
                
            # Extract video_id from YouTube URL
            video_id = self._extract_youtube_video_id(youtube_url)
            if not video_id:
                return None, "Invalid YouTube URL format"
            
            # Get transcript
            transcript = self._get_youtube_transcript(video_id)
            if not transcript:
                return None, "Failed to retrieve YouTube transcript"
            
            # Summarize transcript
            summary_message = self._create_summary_message(transcript)
            summary = self.gemini_service.llm.invoke(summary_message).content
            
            return summary, None
            
        except Exception as e:
            return None, f"Error processing YouTube video: {str(e)}"
    
    def extract_content_from_youtube(self, youtube_url: str) -> Tuple[str, Optional[str]]:
        """
        Extract transcript content from YouTube video for use in learning services.
        
        Returns:
            Tuple of (transcript_text, error_message)
        """
        try:
            if not YOUTUBE_API_AVAILABLE:
                return None, "YouTube transcript API not available. Please install 'youtube_transcript_api' package."
                
            # Extract video_id from YouTube URL
            video_id = self._extract_youtube_video_id(youtube_url)
            if not video_id:
                return None, "Invalid YouTube URL format"
            
            # Get transcript
            transcript = self._get_youtube_transcript(video_id)
            if not transcript:
                return None, "Failed to retrieve YouTube transcript"
            
            return transcript, None
            
        except Exception as e:
            return None, f"Error extracting YouTube transcript: {str(e)}"
    
    def _extract_youtube_video_id(self, youtube_url: str) -> Optional[str]:
        """Extract YouTube video ID from URL."""
        # Regular expression patterns for different YouTube URL formats
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',  # Standard youtube.com URLs
            r'(?:embed\/)([0-9A-Za-z_-]{11})',   # Embedded URLs
            r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',  # youtu.be URLs
            r'^([0-9A-Za-z_-]{11})$'  # Just the ID itself
        ]
        
        # Clean the URL first
        youtube_url = youtube_url.strip()
        
        # Try each pattern
        for pattern in patterns:
            match = re.search(pattern, youtube_url)
            if match:
                return match.group(1)
        
        print(f"Failed to extract video ID from URL: {youtube_url}")
        return None
    
    def _get_youtube_transcript(self, video_id: str) -> Optional[str]:
        """Get transcript for a YouTube video."""
        if not YOUTUBE_API_AVAILABLE:
            print("YouTube transcript API not available")
            return None
            
        try:
            print(f"Attempting to fetch transcript for YouTube video ID: {video_id}")
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get English transcript first
            try:
                print("Searching for English transcript")
                transcript = transcript_list.find_transcript(['en'])
                print(f"Found English transcript: {transcript}")
            except NoTranscriptFound:
                print("No English transcript found, trying alternatives")
                try:
                    # Try US or GB English
                    transcript = transcript_list.find_transcript(['en-US', 'en-GB'])
                    print(f"Found alternative English transcript: {transcript}")
                except:
                    # Get first available transcript and translate to English
                    available_transcripts = list(transcript_list._transcripts.keys())
                    print(f"Available transcripts: {available_transcripts}")
                    if available_transcripts:
                        first_lang = available_transcripts[0]
                        print(f"Using first available language: {first_lang}")
                        transcript = transcript_list.find_transcript([first_lang])
                        print("Translating to English")
                        transcript = transcript.translate('en')
                    else:
                        print("No transcripts available")
                        return None
            
            # Get the actual transcript data
            print("Fetching transcript data")
            transcript_data = transcript.fetch()
            
            # Join all transcript segments into a single text
            transcript_text = " ".join([item['text'] for item in transcript_data])
            
            print(f"Transcript length: {len(transcript_text)} characters")
            return transcript_text
            
        except TranscriptsDisabled as e:
            print(f"Transcripts are disabled for this video: {str(e)}")
            return None
        except NoTranscriptFound as e:
            print(f"No transcript found for this video: {str(e)}")
            return None
        except Exception as e:
            print(f"Error fetching YouTube transcript: {str(e)}")
            return None