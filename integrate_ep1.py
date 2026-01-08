import json

# --- QUIZZES ---
with open('app/data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('NEW_QUIZ_EP1.json', 'r', encoding='utf-8') as f:
    quiz = json.load(f)

# Unlabel old quizzes if any
found = False
for q in quizzes:
    if q.get('episodeId') == 1:
        print(f"Replacing/Unlabeling old quiz: {q['title']}")
        del q['episodeId']
        q['title'] += " (Old)"
        found = True

if not found:
    print("No existing Episode 1 quiz found.")

quizzes.append(quiz)
quizzes.sort(key=lambda x: (x.get('episodeId') or 999, x['id']))

with open('app/data/quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, indent=4)
print("✅ Quizzes updated.")


# --- FLASHCARDS ---
with open('app/data/flashcards.json', 'r', encoding='utf-8') as f:
    cards_list = json.load(f)

with open('NEW_FLASHCARDS_EP1.json', 'r', encoding='utf-8') as f:
    new_cards = json.load(f)

existing_index = -1
for i, deck in enumerate(cards_list):
    if deck.get('episodeId') == 1:
        existing_index = i
        break

if existing_index != -1:
    print(f"Replacing existing Ep 1 flashcards (Index {existing_index})")
    cards_list[existing_index] = new_cards
else:
    print("Adding new Ep 1 flashcards")
    cards_list.append(new_cards)

cards_list.sort(key=lambda x: x.get('episodeId') or 999)

with open('app/data/flashcards.json', 'w', encoding='utf-8') as f:
    json.dump(cards_list, f, indent=4)
print("✅ Flashcards updated.")
