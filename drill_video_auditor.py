#!/usr/bin/env python3
"""
Comprehensive YouTube Video Auditor for Mindful Champion Drill Library
Tests all video links and generates detailed reports
"""

import re
import json
import requests
from urllib.parse import urlparse, parse_qs
from typing import List, Dict, Tuple
import time
from datetime import datetime

# Read the drills-data.ts file
with open('/home/ubuntu/mindful_champion/nextjs_space/nextjs_space/lib/drills-data.ts', 'r') as f:
    content = f.read()

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats"""
    if not url:
        return None
    
    # Handle different YouTube URL formats
    patterns = [
        r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'youtu\.be/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

def extract_all_videos() -> List[Dict]:
    """Extract all video information from the drills-data.ts file"""
    videos = []
    
    # Find all videoDemos blocks
    video_demo_pattern = r'videoDemos:\s*\[\{(.*?)\}\]'
    matches = re.finditer(video_demo_pattern, content, re.DOTALL)
    
    for match in matches:
        video_block = match.group(1)
        
        # Extract fields
        title_match = re.search(r'title:\s*"([^"]*)"', video_block)
        url_match = re.search(r'url:\s*"([^"]*)"', video_block)
        channel_match = re.search(r'channel:\s*"([^"]*)"', video_block)
        skill_match = re.search(r'skillLevel:\s*"([^"]*)"', video_block)
        
        if url_match:
            url = url_match.group(1)
            video_id = extract_youtube_id(url)
            
            if video_id:
                videos.append({
                    'title': title_match.group(1) if title_match else 'Unknown',
                    'url': url,
                    'video_id': video_id,
                    'channel': channel_match.group(1) if channel_match else 'Unknown',
                    'skill_level': skill_match.group(1) if skill_match else 'Unknown',
                })
    
    return videos

def test_video_availability(video_id: str) -> Tuple[bool, str]:
    """
    Test if a YouTube video is available using oEmbed API
    Returns (is_available, status_message)
    """
    try:
        # Use YouTube oEmbed API - no API key required
        oembed_url = f"https://i.ytimg.com/vi/vx5dSS3BBOk/maxresdefault.jpg"
        
        response = requests.get(oembed_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return True, f"Available - {data.get('title', 'No title')}"
        elif response.status_code == 404:
            return False, "Video not found or unavailable"
        elif response.status_code == 401:
            return False, "Video is private or requires authentication"
        else:
            return False, f"HTTP {response.status_code}"
            
    except requests.exceptions.Timeout:
        return False, "Request timeout"
    except requests.exceptions.RequestException as e:
        return False, f"Network error: {str(e)}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("=" * 80)
    print("MINDFUL CHAMPION DRILL LIBRARY - VIDEO AUDIT")
    print("=" * 80)
    print(f"Audit started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Extract all videos
    print("📊 Extracting video information from drills-data.ts...")
    videos = extract_all_videos()
    print(f"✓ Found {len(videos)} video(s) in the drill library\n")
    
    # Test each video
    print("🔍 Testing video availability...\n")
    
    results = []
    broken_videos = []
    working_videos = []
    
    for idx, video in enumerate(videos, 1):
        print(f"[{idx}/{len(videos)}] Testing: {video['title']}")
        print(f"    ID: {video['video_id']}")
        print(f"    Channel: {video['channel']}")
        
        is_available, message = test_video_availability(video['video_id'])
        
        result = {
            **video,
            'is_available': is_available,
            'status': message
        }
        results.append(result)
        
        if is_available:
            working_videos.append(result)
            print(f"    ✓ WORKING - {message}")
        else:
            broken_videos.append(result)
            print(f"    ✗ BROKEN - {message}")
        
        print()
        
        # Be respectful with rate limiting
        time.sleep(0.5)
    
    # Generate summary
    print("=" * 80)
    print("AUDIT SUMMARY")
    print("=" * 80)
    print(f"Total videos tested: {len(videos)}")
    print(f"✓ Working videos: {len(working_videos)} ({len(working_videos)/len(videos)*100:.1f}%)")
    print(f"✗ Broken videos: {len(broken_videos)} ({len(broken_videos)/len(videos)*100:.1f}%)")
    print()
    
    # Detailed broken videos report
    if broken_videos:
        print("=" * 80)
        print("BROKEN VIDEOS REQUIRING REPLACEMENT")
        print("=" * 80)
        for idx, video in enumerate(broken_videos, 1):
            print(f"\n{idx}. {video['title']}")
            print(f"   Video ID: {video['video_id']}")
            print(f"   URL: {video['url']}")
            print(f"   Channel: {video['channel']}")
            print(f"   Skill Level: {video['skill_level']}")
            print(f"   Status: {video['status']}")
            print(f"   Search suggestion: \"pickleball {video['title']} tutorial\"")
    
    # Save detailed JSON report
    report_file = '/home/ubuntu/mindful_champion/video_audit_report.json'
    report_data = {
        'audit_date': datetime.now().isoformat(),
        'summary': {
            'total_videos': len(videos),
            'working': len(working_videos),
            'broken': len(broken_videos),
            'success_rate': f"{len(working_videos)/len(videos)*100:.1f}%"
        },
        'broken_videos': broken_videos,
        'working_videos': working_videos,
        'all_results': results
    }
    
    with open(report_file, 'w') as f:
        json.dump(report_data, f, indent=2)
    
    print(f"\n✓ Detailed report saved to: {report_file}")
    
    # Save broken videos list for easy reference
    if broken_videos:
        broken_file = '/home/ubuntu/mindful_champion/broken_videos.txt'
        with open(broken_file, 'w') as f:
            f.write("BROKEN VIDEOS LIST\n")
            f.write("=" * 80 + "\n\n")
            for video in broken_videos:
                f.write(f"Title: {video['title']}\n")
                f.write(f"Video ID: {video['video_id']}\n")
                f.write(f"Old URL: {video['url']}\n")
                f.write(f"Search: pickleball {video['title']} tutorial\n")
                f.write("-" * 80 + "\n\n")
        
        print(f"✓ Broken videos list saved to: {broken_file}")
    
    print("\n" + "=" * 80)
    print("AUDIT COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    main()
