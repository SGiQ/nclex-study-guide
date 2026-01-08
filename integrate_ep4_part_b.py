import json

# Load existing quizzes
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

# Load new quiz
with open('NEW_QUIZ_EP4_PART_B.json', 'r', encoding='utf-8') as f:
    quiz_b = json.load(f)

# Update Ep 4 Part A title to make it clear
updated_a = False
for quiz in quizzes:
    if quiz.get('episodeId') == 4 and quiz.get('title') == "Health Promotion & Maintenance":
        quiz['title'] = "Health Promotion & Maintenance - Part A"
        updated_a = True
        print(f"Renamed existing Ep 4 quiz to: {quiz['title']}")

# Check if Part B already exists to prevent duplicates
exists = any(q.get('title') == quiz_b['title'] for q in quizzes)
if not exists:
    quizzes.append(quiz_b)
    print("Added new Ep 4 Part B quiz.")
else:
    print("Ep 4 Part B quiz already exists. Updating...")
    for i, q in enumerate(quizzes):
        if q.get('title') == quiz_b['title']:
            quizzes[i] = quiz_b

# Sort
quizzes.sort(key=lambda x: (x.get('episodeId') or 999, x['id']))

# Save
with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)
print("✅ Quizzes updated.")
