import json

# Load data
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('app/data/episodes.json', 'r', encoding='utf-8') as f:
    episodes = json.load(f)

# Create episode lookup
episode_map = {ep['id']: ep for ep in episodes}

# Group quizzes by episode
quizzes_by_episode = {}
for quiz in quizzes:
    ep_id = quiz.get('episodeId', 'NONE')
    if ep_id not in quizzes_by_episode:
        quizzes_by_episode[ep_id] = []
    quizzes_by_episode[ep_id].append(quiz)

# Print audit report
print("=" * 80)
print("QUIZ-EPISODE ALIGNMENT AUDIT")
print("=" * 80)

# Check each episode
for ep_id in range(1, 17):  # Episodes 1-16
    print(f"\n📚 EPISODE {ep_id}: {episode_map[ep_id]['title']}")
    print(f"   Content: {episode_map[ep_id]['description']}")
    
    if ep_id in quizzes_by_episode:
        print(f"   ✅ HAS {len(quizzes_by_episode[ep_id])} QUIZ(ES):")
        for quiz in quizzes_by_episode[ep_id]:
            print(f"      - Quiz #{quiz['id']}: {quiz['title']} ({quiz['questionCount']} questions)")
    else:
        print(f"   ❌ NO QUIZ FOUND")

# Check for quizzes without episode
if 'NONE' in quizzes_by_episode:
    print(f"\n⚠️  QUIZZES WITHOUT EPISODE ID:")
    for quiz in quizzes_by_episode['NONE']:
        print(f"   - Quiz #{quiz['id']}: {quiz['title']} ({quiz['questionCount']} questions)")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total Episodes: 16")
print(f"Total Quizzes: {len(quizzes)}")
print(f"Episodes with quizzes: {len([ep for ep in range(1, 17) if ep in quizzes_by_episode])}")
print(f"Episodes without quizzes: {len([ep for ep in range(1, 17) if ep not in quizzes_by_episode])}")
print(f"Missing episodes: {[ep for ep in range(1, 17) if ep not in quizzes_by_episode]}")
