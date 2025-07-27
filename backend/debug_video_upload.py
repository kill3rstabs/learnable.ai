#!/usr/bin/env python3
"""
Debug script to test video file uploads and identify broken pipe issues.
"""
import requests
import os
import time
from pathlib import Path

def test_video_upload(video_file_path: str, endpoint: str = "http://localhost:8000/api/learning/summarize-content"):
    """
    Test video file upload to identify issues.
    """
    if not os.path.exists(video_file_path):
        print(f"Error: Video file not found: {video_file_path}")
        return
    
    file_size = os.path.getsize(video_file_path)
    print(f"Testing video upload: {video_file_path}")
    print(f"File size: {file_size / (1024*1024):.2f} MB")
    
    try:
        with open(video_file_path, 'rb') as f:
            files = {'video_file': (os.path.basename(video_file_path), f, 'video/mp4')}
            
            print("Starting upload...")
            start_time = time.time()
            
            response = requests.post(
                endpoint,
                files=files,
                timeout=300  # 5 minutes timeout
            )
            
            end_time = time.time()
            duration = end_time - start_time
            
            print(f"Upload completed in {duration:.2f} seconds")
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                if 'error' in result:
                    print(f"Error: {result['error']}")
                else:
                    print("Success! Video processed successfully.")
                    print(f"Content type: {result.get('content_type')}")
            else:
                print(f"HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
    except requests.exceptions.Timeout:
        print("Error: Request timed out")
    except requests.exceptions.ConnectionError as e:
        print(f"Error: Connection error - {e}")
    except Exception as e:
        print(f"Error: {e}")

def test_multiple_endpoints(video_file_path: str):
    """
    Test video upload on multiple endpoints.
    """
    endpoints = [
        "http://localhost:8000/api/learning/summarize-content",
        "http://localhost:8000/api/learning/generate-mindmap-multimedia",
        "http://localhost:8000/api/learning/generate-mcq-quiz-multimedia",
        "http://localhost:8000/api/learning/generate-flashcards-multimedia"
    ]
    
    for endpoint in endpoints:
        print(f"\n{'='*60}")
        print(f"Testing endpoint: {endpoint}")
        print(f"{'='*60}")
        test_video_upload(video_file_path, endpoint)
        time.sleep(2)  # Wait between requests

if __name__ == "__main__":
    # Test with a sample video file
    # Replace with path to your test video file
    test_video_path = "test_video.mp4"  # Update this path
    
    if os.path.exists(test_video_path):
        test_multiple_endpoints(test_video_path)
    else:
        print(f"Please provide a valid video file path. Current path '{test_video_path}' not found.")
        print("Usage: python debug_video_upload.py")
        print("Make sure to update the test_video_path variable with your video file path.") 