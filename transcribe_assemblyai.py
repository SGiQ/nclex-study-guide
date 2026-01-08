import assemblyai as aai
import json
import os
import sys

def transcribe_with_assemblyai(episode_num, api_key):
    """
    Transcribe an episode using AssemblyAI with speaker detection
    """
    print(f"=== Transcribing Episode {episode_num} with AssemblyAI ===\n")
    
    # Set API key
    aai.settings.api_key = api_key
    
    # Build file path
    audio_file = os.path.join("public", "uploads", f"episode-{episode_num}.mp3")
    
    # Check file exists
    if not os.path.exists(audio_file):
        print(f"❌ ERROR: File not found: {audio_file}")
        return False
    
    file_size_mb = os.path.getsize(audio_file) / (1024 * 1024)
    print(f"✅ Found audio file: {audio_file}")
    print(f"📦 File size: {file_size_mb:.1f} MB\n")
    
    # Configure transcription
    config = aai.TranscriptionConfig(
        speaker_labels=True,  # Enable speaker detection
        language_code="en"
    )
    
    print("🚀 Uploading and transcribing...")
    print("   This will take 2-3 minutes...\n")
    
    try:
        # Create transcriber
        transcriber = aai.Transcriber()
        
        # Transcribe
        transcript = transcriber.transcribe(audio_file, config=config)
        
        # Check for errors
        if transcript.status == aai.TranscriptStatus.error:
            print(f"❌ Transcription failed: {transcript.error}")
            return False
        
        print("✅ Transcription complete!\n")
        
        # Process results
        segments = []
        for utterance in transcript.utterances:
            segment = {
                "start": utterance.start / 1000,  # Convert ms to seconds
                "end": utterance.end / 1000,
                "text": utterance.text,
                "speaker": f"Speaker {utterance.speaker}"
            }
            segments.append(segment)
        
        # Save plain text
        txt_file = f"episode-{episode_num}-transcript.txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            for seg in segments:
                f.write(f"[{format_time(seg['start'])}] {seg['speaker']}: {seg['text']}\n\n")
        print(f"✅ Text saved: {txt_file}")
        
        # Save JSON for app
        json_file = f"episode-{episode_num}-transcript.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(segments, f, indent=2, ensure_ascii=False)
        print(f"✅ JSON saved: {json_file}")
        
        # Print summary
        speakers = set(seg['speaker'] for seg in segments)
        print(f"\n📊 Summary:")
        print(f"   Total segments: {len(segments)}")
        print(f"   Speakers detected: {len(speakers)} ({', '.join(sorted(speakers))})")
        print(f"   Duration: {format_time(segments[-1]['end'])}")
        
        print(f"\n📝 First 3 segments:")
        for seg in segments[:3]:
            print(f"   [{format_time(seg['start'])}] {seg['speaker']}: {seg['text'][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def format_time(seconds):
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins}:{secs:02d}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe_assemblyai.py <episode_number> [api_key]")
        print("\nIf api_key is not provided, set ASSEMBLYAI_API_KEY environment variable")
        sys.exit(1)
    
    episode = int(sys.argv[1])
    
    # Get API key from argument or environment
    api_key = sys.argv[2] if len(sys.argv) > 2 else os.getenv('ASSEMBLYAI_API_KEY')
    
    if not api_key:
        print("❌ ERROR: No API key provided!")
        print("\nOptions:")
        print("1. Pass as argument: python transcribe_assemblyai.py 10 YOUR_API_KEY")
        print("2. Set environment variable: set ASSEMBLYAI_API_KEY=YOUR_API_KEY")
        print("\nGet your free API key at: https://www.assemblyai.com/dashboard/signup")
        sys.exit(1)
    
    success = transcribe_with_assemblyai(episode, api_key)
    
    if success:
        print("\n✅ Transcription complete!")
        print("\nNext steps:")
        print("1. Check the generated files")
        print("2. Copy the JSON content to app/data/transcripts.ts")
    else:
        print("\n❌ Transcription failed!")
        sys.exit(1)
