"""
Custom middleware for handling large file uploads and preventing broken pipe errors.
"""
import logging
import time
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)

class LargeFileUploadMiddleware:
    """
    Middleware to handle large file uploads and prevent broken pipe errors.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Check if this is a file upload request
        if request.method == 'POST' and any(field in request.FILES for field in ['audio_file', 'video_file', 'document_file']):
            # Log file upload information
            for field_name, uploaded_file in request.FILES.items():
                logger.info(f"File upload: {field_name} = {uploaded_file.name}, size = {uploaded_file.size} bytes")
                
                # Check file size limits
                if uploaded_file.size > settings.FILE_UPLOAD_MAX_MEMORY_SIZE:
                    return JsonResponse({
                        'error': f'File size {uploaded_file.size} bytes exceeds maximum allowed size of {settings.FILE_UPLOAD_MAX_MEMORY_SIZE} bytes'
                    }, status=413)
        
        # Add request start time
        request.start_time = time.time()
        
        try:
            response = self.get_response(request)
            
            # Log request duration for file uploads
            if hasattr(request, 'start_time'):
                duration = time.time() - request.start_time
                if duration > 10:  # Log slow requests (>10 seconds)
                    logger.info(f"Slow request: {request.path} took {duration:.2f} seconds")
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing request {request.path}: {str(e)}")
            return JsonResponse({
                'error': f'Internal server error: {str(e)}'
            }, status=500)

class TimeoutMiddleware:
    """
    Middleware to handle request timeouts.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Set a longer timeout for file upload requests
        if request.method == 'POST' and any(field in request.FILES for field in ['audio_file', 'video_file', 'document_file']):
            # This is handled by the server configuration, but we can log it
            logger.info(f"File upload request detected: {request.path}")
        
        return self.get_response(request) 