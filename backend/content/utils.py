import requests


def poll_for_transcript(job_id: str, api_key: str, max_attempts: int = 30) -> str:
    """
    Poll Rev.ai for job completion and return transcript
    """
    import time
    
    status_url = f"https://api.rev.ai/speechtotext/v1/jobs/{job_id}"
    transcript_url = f"https://api.rev.ai/speechtotext/v1/jobs/{job_id}/transcript"
    
    headers = {'Authorization': f'Bearer {api_key}'}
    
    for attempt in range(max_attempts):
        # Check job status
        status_response = requests.get(status_url, headers=headers)
        
        if status_response.status_code != 200:
            raise Exception(f"Failed to get job status: {status_response.status_code}")
        
        job_status = status_response.json()
        status = job_status.get('status')
        
        if status == 'transcribed':  # Rev.ai uses 'transcribed' status
            # Get transcript in plain text format
            transcript_headers = {
                'Authorization': f'Bearer {api_key}',
                'Accept': 'text/plain'
            }
            
            transcript_response = requests.get(transcript_url, headers=transcript_headers)
            
            if transcript_response.status_code != 200:
                raise Exception(f"Failed to get transcript: {transcript_response.status_code}")
            
            return transcript_response.text
        
        elif status == 'failed':
            raise Exception(f"Job failed: {job_status.get('failure_detail', 'Unknown error')}")
        
        # Wait before next poll
        time.sleep(2)
    
    raise Exception("Job did not complete within expected time")