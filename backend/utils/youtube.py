# youtube.py
# This file will contain helper functions for YouTube processing

import re
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled

def is_youtube_url(url: str) -> bool:
    """
    Determine whether the input string is a valid YouTube video URL.
    
    Returns:
        bool: True if the input matches common YouTube URL formats; otherwise, False.
    """
    if not isinstance(url, str):
        return False
    # Regex to check for various youtube URL formats
    youtube_regex = (
        r'(https?://)?(www\.)?'
        r'(youtube|youtu|youtube-nocookie)\.(com|be)/'
        r'(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})')
    return re.match(youtube_regex, url) is not None

def get_youtube_transcript(url: str) -> tuple[str | None, str | None]:
    """
    Retrieve the transcript text for a YouTube video given its URL.
    
    Attempts to extract the video ID from the provided URL and fetches the transcript using the YouTubeTranscriptApi. Returns a tuple containing the transcript text and an error message; one of the two will be None depending on success or failure.
    
    Parameters:
        url (str): The URL of the YouTube video.
    
    Returns:
        tuple[str | None, str | None]: A tuple where the first element is the transcript text if retrieval is successful (otherwise None), and the second element is an error message if retrieval fails (otherwise None).
    """
    video_id_match = re.search(r'(?<=v=)[^&#]+', url) or \
                     re.search(r'(?<=be/)[^&#]+', url) or \
                     re.search(r'(?<=embed/)[^&#]+', url)

    if not video_id_match:
        return None, "Invalid YouTube URL: Could not extract video ID."

    video_id = video_id_match.group(0)

    try:
        # To-do: Add language support in the future
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([item['text'] for item in transcript_list])
        return transcript, None
    except NoTranscriptFound:
        return None, f"Could not retrieve a transcript for the video with ID: {video_id}. Transcripts may be disabled for this video or it might not have a transcript in the default language."
    except TranscriptsDisabled:
        return None, f"Transcripts are disabled for the video with ID: {video_id}."
    except Exception as e:
        return None, f"An unexpected error occurred while fetching the transcript for video ID {video_id}: {str(e)}"
