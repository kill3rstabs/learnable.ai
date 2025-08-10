# youtube.py
# This file will contain helper functions for YouTube processing

import re
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled

def is_youtube_url(url: str) -> bool:
    """
    Checks if the given URL is a valid YouTube URL.
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
    Fetches the transcript for a given YouTube URL.

    Args:
        url: The URL of the YouTube video.

    Returns:
        A tuple containing the transcript text and an error message.
        If successful, the error message will be None.
        If an error occurs, the transcript will be None.
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
