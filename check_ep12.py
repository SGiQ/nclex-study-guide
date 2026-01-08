import json

with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('app/data/episodes.json', 'r', encoding='utf-8') as f:
    episodes = json.load(f)

# Find Episode 12
ep12 = next(ep for ep in episodes if ep['id'] == 12)
print(f"EPISODE 12: {ep12['title']}")
print(f"Content: {ep12['description']}")
print(f"Details: {ep12['content'][:200]}...")
print()

# Find quizzes for Episode 12
ep12_quizzes = [q for q in quizzes if q.get('episodeId') == 12]
print(f"Found {len(ep12_quizzes)} quiz(es) for Episode 12:")
print()

for quiz in ep12_quizzes:
    print(f"Quiz #{quiz['id']}: {quiz['title']}")
    print(f"  Description: {quiz['description']}")
    print(f"  Questions: {quiz['questionCount']}")
    print(f"  Alignment: ", end="")
    
    # Check alignment
    if "Electrolyte" in quiz['title'] or "Acid-Base" in quiz['title']:
        print("✅ GOOD - Matches Episode 12 (Fluid & Electrolytes, Acid-Base)")
    elif "Immunology" in quiz['title'] or "Hematology" in quiz['title']:
        print("❌ BAD - Should be Episode 14 (Hematology/Immunology)")
    else:
        print("⚠️ REVIEW NEEDED")
    print()
