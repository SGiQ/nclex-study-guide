import json

# Read quizzes and new quizzes
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('NEW_QUIZ_EP6_PART_A.json', 'r', encoding='utf-8') as f:
    part_a = json.load(f)

with open('NEW_QUIZ_EP6_PART_B.json', 'r', encoding='utf-8') as f:
    part_b = json.load(f)

# Find old Episode 6 quiz(zes) and remove episodeId
found_old = False
for quiz in quizzes:
    if quiz.get('episodeId') == 6:
        print(f"Unlabeling old quiz: {quiz['title']} (ID: {quiz['id']})")
        print(f"  Removing episodeId {quiz['episodeId']}")
        del quiz['episodeId']
        # Rename if it looks like the mismatched Psychosocial one
        if "Psychosocial" in quiz['title']:
            quiz['title'] = "Psychosocial Integrity (Unassigned)"
        print(f"  Renamed to: {quiz['title']}")
        found_old = True

if not found_old:
    print("No existing Episode 6 quiz found to unlabel.")

# Add new quizzes
print(f"\nAdding new Episode 6 quizzes:")
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
ep6_quizzes = [q for q in quizzes if q.get('episodeId') == 6]
ep6_questions = sum(q['questionCount'] for q in ep6_quizzes)

print(f"\n✅ Complete!")
print(f"Total quizzes: {len(quizzes)}")
print(f"Total questions: {total_questions}")
print(f"Episode 6 quizzes: {len(ep6_quizzes)} ({ep6_questions} questions)")
