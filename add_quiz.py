import json

# Read existing quizzes
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

# Read new quiz
with open('NEW_QUIZ_EPISODE_2_PART_B.json', 'r', encoding='utf-8') as f:
    new_quiz = json.load(f)

# Add new quiz
quizzes.append(new_quiz)

# Write back
with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)

print(f"✅ Added quiz #{new_quiz['id']}: {new_quiz['title']} with {new_quiz['questionCount']} questions")
print(f"📊 Total quizzes: {len(quizzes)}")
total_questions = sum(q['questionCount'] for q in quizzes)
print(f"📝 Total questions: {total_questions}")
