import json

# Read quizzes and new quizzes
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('NEW_QUIZ_EP5_PART_A.json', 'r', encoding='utf-8') as f:
    part_a = json.load(f)

with open('NEW_QUIZ_EP5_PART_B.json', 'r', encoding='utf-8') as f:
    part_b = json.load(f)

# Find old Episode 5 quiz (id=5) and remove episodeId
for quiz in quizzes:
    if quiz['id'] == 5 and quiz.get('episodeId') == 5:
        print(f"Unlabeling old quiz: {quiz['title']}")
        print(f"  Removing episodeId {quiz['episodeId']}")
        del quiz['episodeId']
        quiz['title'] = "Maternity & OB Nursing"  # Rename for clarity
        print(f"  Renamed to: {quiz['title']}")
        break

# Add new quizzes
print(f"\nAdding new Episode 5 quizzes:")
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
ep5_quizzes = [q for q in quizzes if q.get('episodeId') == 5]
ep5_questions = sum(q['questionCount'] for q in ep5_quizzes)

print(f"\n✅ Complete!")
print(f"Total quizzes: {len(quizzes)}")
print(f"Total questions: {total_questions}")
print(f"Episode 5 quizzes: {len(ep5_quizzes)} ({ep5_questions} questions)")
