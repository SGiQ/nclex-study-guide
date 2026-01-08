import json

# Read flashcards and new flashcards
with open('app/data/flashcards.json', 'r', encoding='utf-8') as f:
    cards_list = json.load(f)

with open('NEW_FLASHCARDS_EP7.json', 'r', encoding='utf-8') as f:
    new_cards = json.load(f)

# Find old Ep 7 flashcards (if any) and remove or update
# (Based on my search, there were none, but good to be safe)
existing_index = -1
for i, deck in enumerate(cards_list):
    if deck.get('episodeId') == 7:
        existing_index = i
        break

if existing_index != -1:
    print(f"Replacing existing Episode 7 flashcards (Index {existing_index})")
    cards_list[existing_index] = new_cards
else:
    print(f"Adding new Episode 7 flashcards")
    cards_list.append(new_cards)

# Sort by episodeId
cards_list.sort(key=lambda x: x.get('episodeId') or 999)

# Save
with open('app/data/flashcards.json', 'w', encoding='utf-8') as f:
    json.dump(cards_list, f, indent=4)

print(f"\n✅ Complete! Flashcards.json updated.")
print(f"Total decks: {len(cards_list)}")
ep7_deck = next((d for d in cards_list if d.get('episodeId') == 7), None)
if ep7_deck:
    print(f"Episode 7 Deck: {ep7_deck['title']} ({len(ep7_deck['cards'])} cards)")
