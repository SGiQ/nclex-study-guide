import json

# --- QUIZZES ---
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('NEW_QUIZ_EP12_PART_A.json', 'r', encoding='utf-8') as f:
    quiz_a = json.load(f)

with open('NEW_QUIZ_EP12_PART_B.json', 'r', encoding='utf-8') as f:
    quiz_b = json.load(f)

# Unlabel old quizzes
found_old = False
for quiz in quizzes:
    if quiz.get('episodeId') == 12:
        print(f"Unlabeling old quiz: {quiz['title']} (ID: {quiz['id']})")
        del quiz['episodeId']
        if "Part 1" in quiz['title']:
             quiz['title'] = "Physiological Adaptation Part 1 (Unassigned)"
        found_old = True

if not found_old:
    print("No existing Episode 12 quiz found.")

quizzes.append(quiz_a)
quizzes.append(quiz_b)
quizzes.sort(key=lambda x: (x.get('episodeId') or 999, x['id']))

with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)
print("✅ Quizzes updated.")


# --- FLASHCARDS ---
with open('app/data/flashcards.json', 'r', encoding='utf-8') as f:
    cards_list = json.load(f)

with open('NEW_FLASHCARDS_EP12.json', 'r', encoding='utf-8') as f:
    new_cards = json.load(f)

existing_index = -1
for i, deck in enumerate(cards_list):
    if deck.get('episodeId') == 12:
        existing_index = i
        break

if existing_index != -1:
    print(f"Replacing existing Ep 12 flashcards (Index {existing_index})")
    cards_list[existing_index] = new_cards
else:
    print("Adding new flashcards for Ep 12")
    cards_list.append(new_cards)

cards_list.sort(key=lambda x: x.get('episodeId') or 999)

with open('app/data/flashcards.json', 'w', encoding='utf-8') as f:
    json.dump(cards_list, f, indent=4)
print("✅ Flashcards updated.")
