import json

# Read quizzes and new quizzes
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('NEW_QUIZ_EP7_PART_A.json', 'r', encoding='utf-8') as f:
    part_a = json.load(f)

with open('NEW_QUIZ_EP7_PART_B.json', 'r', encoding='utf-8') as f:
    part_b = json.load(f)

# Find old Episode 7 quiz(zes) and remove episodeId
found_old = False
for quiz in quizzes:
    if quiz.get('episodeId') == 7:
        print(f"Unlabeling old quiz: {quiz['title']} (ID: {quiz['id']})")
        print(f"  Removing episodeId {quiz['episodeId']}")
        del quiz['episodeId']
        # Rename if it looks like the mismatched Basic Care one
        if "Basic Care" in quiz['title']:
            quiz['title'] = "Basic Care Review (Unassigned)"
        print(f"  Renamed to: {quiz['title']}")
        found_old = True

if not found_old:
    print("No existing Episode 7 quiz found to unlabel.")

# Add new quizzes
print(f"\nAdding new Episode 7 quizzes:")
print(f"  Part A: {part_a['title']} ({part_a['questionCount']} questions)")
quizzes.append(part_a)

print(f"  Part B: {part_b['title']} ({part_b['questionCount']} questions)")
quizzes.append(part_b)

# Sort by episode ID (handle missing episodeId by putting them at end)
quizzes.sort(key=lambda x: (x.get('episodeId') or 999, x['id']))

# Save
with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)

# Summary
total_questions = sum(q['questionCount'] for q in quizzes)
ep7_quizzes = [q for q in quizzes if q.get('episodeId') == 7]
ep7_questions = sum(q['questionCount'] for q in ep7_quizzes)

print(f"\n✅ Complete!")
print(f"Total quizzes: {len(quizzes)}")
print(f"Total questions: {total_questions}")
print(f"Episode 7 quizzes: {len(ep7_quizzes)} ({ep7_questions} questions)")
