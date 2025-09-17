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
    # Regex to extract the video ID from various YouTube URL formats
    regex = r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})"

    video_id_match = re.search(regex, url)

    if not video_id_match:
        return None, "Invalid YouTube URL: Could not extract video ID."

    video_id = video_id_match.group(1)

    try:
        # Prefer robust flow over direct get_transcript
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        preferred_langs = ['en', 'en-US', 'en-GB']
        selected_transcript = None

        # 1) Try human-created English captions
        try:
            selected_transcript = transcript_list.find_transcript(preferred_langs)
        except Exception:
            selected_transcript = None

        # 2) Try auto-generated English captions
        if selected_transcript is None:
            try:
                selected_transcript = transcript_list.find_generated_transcript(preferred_langs)
            except Exception:
                selected_transcript = None

        # 3) Try translating any available transcript to English
        if selected_transcript is None:
            for t in transcript_list:
                if getattr(t, 'is_translatable', False):
                    try:
                        selected_transcript = t.translate('en')
                        break
                    except Exception:
                        continue

        # 4) Fallback: use any available transcript
        if selected_transcript is None:
            try:
                selected_transcript = next(iter(transcript_list))
            except StopIteration:
                raise NoTranscriptFound(video_id)

        entries = selected_transcript.fetch()
        text_chunks = []
        for item in entries:
            text = item.get('text') or ''
            if not text:
                continue
            text_chunks.append(text)

        transcript_text = " ".join(text_chunks).strip()
        if not transcript_text:
            return None, f"Empty transcript received for video ID: {video_id}."
        return transcript_text, None

    except NoTranscriptFound:
        return None, f"No transcript found for the video with ID: {video_id}."
    except TranscriptsDisabled:
        return None, f"Transcripts are disabled for the video with ID: {video_id}."
    except Exception as e:
        # Handle common upstream issues more clearly
        message = str(e)
        if '429' in message or 'TooManyRequests' in message:
            return None, "YouTube rate-limited the request. Please try again later."
        if 'no element found' in message:
            return None, (
                f"Received an empty response when fetching transcript for video ID {video_id}. "
                "The video may be restricted or temporarily unavailable."
            )
        # Generic fallback
        return None, (
            f"An unexpected error occurred while fetching the transcript for video ID {video_id}: {message}"
        )
