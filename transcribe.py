import whisper
import json
import os
import sys

def transcribe_episode(episode_num):
    print(f"=== Transcribing Episode {episode_num} ===\n")
    
    # Build file path
    audio_file = os.path.join("public", "uploads", f"episode-{episode_num}.mp3")
    
    # Check file exists
    if not os.path.exists(audio_file):
        print(f"❌ ERROR: File not found: {audio_file}")
        print(f"Current directory: {os.getcwd()}")
        return False
    
    file_size_mb = os.path.getsize(audio_file) / (1024 * 1024)
    print(f"✅ Found audio file: {audio_file}")
    print(f"📦 File size: {file_size_mb:.1f} MB\n")
    
    # Load Whisper model
    print("🔄 Loading Whisper model (base)...")
    print("   (First time will download ~140MB model)")
    try:
        model = whisper.load_model("base")
        print("✅ Model loaded!\n")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False
    
    # Transcribe
    print(f"🎙️  Transcribing... (this will take 5-10 minutes)")
    print("   Progress will be shown below:\n")
    
    try:
        result = model.transcribe(
            audio_file,
            language="en",
            verbose=True,
            word_timestamps=True
        )
    except Exception as e:
        print(f"\n❌ Error during transcription: {e}")
        return False
    
    # Save results
    print("\n\n💾 Saving transcripts...")
    
    # Save plain text
    txt_file = f"episode-{episode_num}-transcript.txt"
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write(result["text"])
    print(f"✅ Text saved: {txt_file}")
    
    # Save JSON with timestamps
    json_file = f"episode-{episode_num}-transcript.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"✅ JSON saved: {json_file}")
    
    # Print summary
    print(f"\n📊 Summary:")
    print(f"   Total segments: {len(result['segments'])}")
    print(f"   Duration: {result['segments'][-1]['end']:.1f} seconds")
    print(f"\n📝 First 500 characters:")
    print(result["text"][:500])
    print("...\n")
    
    return True

if __name__ == "__main__":
    episode = 10
    if len(sys.argv) > 1:
        episode = int(sys.argv[1])
    
    success = transcribe_episode(episode)
    
    if success:
        print("\n✅ Transcription complete!")
    else:
        print("\n❌ Transcription failed!")
        sys.exit(1)
