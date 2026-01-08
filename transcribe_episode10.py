import whisper
import json
import os

print("Loading Whisper model...")
# Using 'base' model for balance of speed and accuracy
model = whisper.load_model("base")

# Transcribe Episode 10
audio_file = os.path.join("public", "uploads", "episode-10.mp3")
print(f"\nTranscribing {audio_file}...")
print(f"File exists: {os.path.exists(audio_file)}")
print("This may take 5-10 minutes depending on audio length...")

if not os.path.exists(audio_file):
    print(f"ERROR: File not found at {audio_file}")
    print(f"Current directory: {os.getcwd()}")
    exit(1)

result = model.transcribe(
    audio_file, 
    language="en", 
    verbose=True,
    word_timestamps=True  # Enable word-level timestamps
)

# Save transcript
output_file = "episode-10-transcript.txt"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(result["text"])

print(f"\n✅ Transcript saved to: {output_file}")
print(f"\nFirst 500 characters:")
print(result["text"][:500])
print("\n...")

# Also save as JSON with timestamps
json_output = "episode-10-transcript.json"
with open(json_output, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"\n✅ Full transcript with timestamps saved to: {json_output}")

# Print segment info
print(f"\nTotal segments: {len(result['segments'])}")
print("\nFirst 3 segments:")
for i, seg in enumerate(result['segments'][:3]):
    print(f"\n[{seg['start']:.2f}s - {seg['end']:.2f}s]: {seg['text']}")
