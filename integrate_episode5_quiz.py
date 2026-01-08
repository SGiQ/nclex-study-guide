import json

# Read existing quizzes
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

# Read new Episode 5 quiz
with open('NEW_QUIZ_EPISODE_5_MATERNITY.json', 'r', encoding='utf-8') as f:
    new_quiz = json.load(f)

# Find and update quiz assignments
for quiz in quizzes:
    # Fix Quiz #12 - Should be Episode 14 (Hematology/Immunology)
    if quiz['id'] == 12 and quiz['title'] == "Immunology, Hematology & GI":
        print(f"Fixing Quiz #12: '{quiz['title']}'")
        print(f"  Old Episode: {quiz.get('episodeId')}")
        quiz['episodeId'] = 14
        print(f"  New Episode: {quiz['episodeId']}")
    
    # Fix Quiz #15 - Check if needs adjustment
    if quiz['id'] == 15:
        print(f"\nQuiz #15: '{quiz['title']}'")
        print(f"  Current Episode: {quiz.get('episodeId')}")
        # Keep it on Episode 14 for now - it's OB emergencies which fits

# Add new Episode 5 quiz
print(f"\nAdding new quiz: {new_quiz['title']}")
quizzes.append(new_quiz)

# Sort by episode ID
quizzes.sort(key=lambda x: (x.get('episodeId') or 999, x['id']))

# Write back
with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)

print(f"\n✅ Complete!")
print(f"📊 Total quizzes: {len(quizzes)}")
total_questions = sum(q['questionCount'] for q in quizzes)
print(f"📝 Total questions: {total_questions}")
