import json

# Load data
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('app/data/episodes.json', 'r', encoding='utf-8') as f:
    episodes = json.load(f)

# Create episode lookup
episode_map = {ep['id']: ep for ep in episodes}

# Sort quizzes by episode
sorted_quizzes = sorted(quizzes, key=lambda x: (x.get('episodeId') or 999, x['id']))

print("=" * 100)
print("QUIZ-EPISODE ALIGNMENT AUDIT (Title & Topic Based)")
print("=" * 100)

# Group by episode
current_ep = None
for quiz in sorted_quizzes:
    ep_id = quiz.get('episodeId')
    
    if ep_id != current_ep:
        current_ep = ep_id
        if ep_id and ep_id in episode_map:
            ep = episode_map[ep_id]
            print(f"\n{'='*100}")
            print(f"EPISODE {ep_id}: {ep['title']}")
            print(f"Episode Topics: {ep['description']}")
            print(f"{'='*100}")
        elif ep_id is None:
            print(f"\n{'='*100}")
            print(f"GENERAL QUIZZES (No Episode Assignment)")
            print(f"{'='*100}")
    
    # Print quiz info
    alignment = "✅ MATCH" if ep_id else "⚪ N/A"
    print(f"\n  Quiz #{quiz['id']}: {quiz['title']}")
    print(f"  Description: {quiz['description']}")
    print(f"  Questions: {quiz['questionCount']}")
    print(f"  Alignment: {alignment}")

# Summary
print(f"\n{'='*100}")
print("SUMMARY")
print(f"{'='*100}")
print(f"Total Episodes: 16")
print(f"Total Quizzes: {len(quizzes)}")
print(f"Total Questions: {sum(q['questionCount'] for q in quizzes)}")

# Count coverage
episodes_with_quizzes = set(q['episodeId'] for q in quizzes if q.get('episodeId'))
print(f"Episodes with quizzes: {len(episodes_with_quizzes)}")
print(f"Episodes without quizzes: {16 - len(episodes_with_quizzes)}")

missing = [i for i in range(1, 17) if i not in episodes_with_quizzes]
if missing:
    print(f"Missing episodes: {missing}")
else:
    print("All episodes have quizzes! ✅")
