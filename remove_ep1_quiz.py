import json

# Remove Ep 1 Quiz based on user feedback
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

initial_count = len(quizzes)
quizzes = [q for q in quizzes if q.get('episodeId') != 1]
final_count = len(quizzes)

if initial_count != final_count:
    print(f"Removed {initial_count - final_count} quiz(zes) for Episode 1.")
    with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
        json.dump(quizzes, f, indent=4)
else:
    print("No Episode 1 quizzes found to remove.")
