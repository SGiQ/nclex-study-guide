import json

# Read quizzes and new quiz
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('NEW_QUIZ_EP3_PART_B.json', 'r', encoding='utf-8') as f:
    part_b = json.load(f)

# Add new quiz
print(f"Adding Episode 3 Part B: {part_b['title']} ({part_b['questionCount']} questions)")
quizzes.append(part_b)

# Sort by episode ID
quizzes.sort(key=lambda x: (x.get('episodeId') or 999, x['id']))

# Save
with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)

# Summary
total_questions = sum(q['questionCount'] for q in quizzes)
ep3_quizzes = [q for q in quizzes if q.get('episodeId') == 3]
ep3_questions = sum(q['questionCount'] for q in ep3_quizzes)

print(f"\n✅ Complete!")
print(f"Total quizzes: {len(quizzes)}")
print(f"Total questions: {total_questions}")
print(f"Episode 3 quizzes: {len(ep3_quizzes)} ({ep3_questions} questions)")
