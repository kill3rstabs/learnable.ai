# Video Upload Troubleshooting Guide

## Issue: Broken Pipe Error for Video Files

### Problem Description
Video files are failing with "broken pipe" errors in the regular API routes, but working fine in Swagger.

### Root Causes
1. **Large File Size**: Video files are typically much larger than audio/document files
2. **Upload Timeout**: Default timeouts are insufficient for large video uploads
3. **Memory Issues**: Large files may cause memory problems during processing
4. **Connection Management**: Frontend may close connection before backend finishes processing

### Solutions Implemented

#### 1. Backend Improvements
- **Increased Timeouts**: Set to 5 minutes for file uploads
- **File Size Limits**: Added 50MB limit for video files
- **Better Error Handling**: More robust file processing with proper cleanup
- **Logging**: Added comprehensive logging to track processing steps
- **Middleware**: Custom middleware to handle large file uploads

#### 2. Frontend Improvements
- **Increased Timeout**: Set to 5 minutes for file uploads
- **Better Error Messages**: More descriptive error messages
- **Progress Tracking**: Improved progress tracking for large files

#### 3. Configuration Changes
- **CORS Settings**: Added support for additional ports
- **File Upload Limits**: Increased to 100MB
- **Memory Settings**: Optimized for large file processing

### Testing

#### 1. Use the Debug Script
```bash
cd backend
python debug_video_upload.py
```

Update the `test_video_path` variable in the script with your video file path.

#### 2. Check Logs
Monitor the logs for detailed information:
```bash
tail -f backend/logs/django.log
```

#### 3. Test Different File Sizes
- Try with smaller video files first (< 10MB)
- Gradually increase file size to identify the breaking point

### Common Issues and Solutions

#### Issue: "Request timed out"
**Solution**: 
- Check if the video file is too large (> 50MB)
- Ensure stable internet connection
- Try with a smaller video file

#### Issue: "File size exceeds limit"
**Solution**:
- Compress the video file
- Use a smaller video file
- Consider splitting large videos

#### Issue: "Network error occurred"
**Solution**:
- Check internet connection
- Ensure the backend server is running
- Check CORS settings

#### Issue: "Invalid JSON response"
**Solution**:
- Check if the backend is returning proper JSON
- Look at the server logs for errors
- Ensure the API endpoint is correct

### Performance Tips

1. **Video Optimization**:
   - Use compressed video formats (MP4 with H.264)
   - Keep video duration reasonable (< 10 minutes)
   - Use lower resolution for testing

2. **Server Configuration**:
   - Ensure sufficient memory for video processing
   - Monitor server resources during uploads
   - Consider using a reverse proxy for large files

3. **Network Considerations**:
   - Use stable internet connection
   - Avoid uploading during peak hours
   - Consider using a wired connection

### Monitoring

#### Key Metrics to Monitor
- Upload duration
- File size vs processing time
- Memory usage during processing
- Error rates by file type

#### Log Analysis
Look for these patterns in the logs:
- `Starting video processing`
- `Video file saved to`
- `Video transcription completed`
- `Error processing video file`

### Debugging Steps

1. **Check File Size**: Ensure video file is under 50MB
2. **Monitor Logs**: Watch the Django logs during upload
3. **Test with Swagger**: Compare behavior with Swagger UI
4. **Check Network**: Monitor network tab in browser dev tools
5. **Verify Endpoints**: Ensure correct API endpoints are being called

### Support

If issues persist:
1. Check the logs in `backend/logs/django.log`
2. Run the debug script with your video file
3. Provide error messages and file details
4. Test with different video files to isolate the issue 