import json

# Read quizzes
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

# Read new quizzes
with open('NEW_QUIZ_EP10_PART_A.json', 'r', encoding='utf-8') as f:
    part_a = json.load(f)

with open('NEW_QUIZ_EP10_PART_B.json', 'r', encoding='utf-8') as f:
    part_b = json.load(f)

# Find old Episode 10 quiz (id=9) and remove episodeId
for quiz in quizzes:
    if quiz['id'] == 9 and quiz.get('episodeId') == 10:
        print(f"Unlabeling old quiz: {quiz['title']}")
        print(f"  Removing episodeId {quiz['episodeId']}")
        del quiz['episodeId']
        quiz['title'] = "Cardiovascular & Diagnostics"  # Rename for clarity
        print(f"  Renamed to: {quiz['title']}")
        break

# Add new quizzes
print(f"\nAdding new Episode 10 quizzes:")
print(f"  Part A: {part_a['title']} ({part_a['questionCount']} questions)")
quizzes.append(part_a)

print(f"  Part B: {part_b['title']} ({part_b['questionCount']} questions)")
quizzes.append(part_b)

# Sort by episode ID
quizzes.sort(key=lambda x: (x.get('episodeId') or 999, x['id']))

# Save
with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)

# Summary
total_questions = sum(q['questionCount'] for q in quizzes)
ep10_quizzes = [q for q in quizzes if q.get('episodeId') == 10]
ep10_questions = sum(q['questionCount'] for q in ep10_quizzes)

print(f"\n✅ Complete!")
print(f"Total quizzes: {len(quizzes)}")
print(f"Total questions: {total_questions}")
print(f"Episode 10 quizzes: {len(ep10_quizzes)} ({ep10_questions} questions)")
