import json

with open('app/data/flashcards.json', 'r', encoding='utf-8') as f:
    flashcards = json.load(f)

ep10 = next((x for x in flashcards if x['episodeId'] == 10), None)

if ep10:
    print(f"Episode 10 Flashcards: {ep10['title']}")
    print(f"Card count: {len(ep10['cards'])}")
    print('\nFirst 10 card topics:')
    for i, card in enumerate(ep10['cards'][:10], 1):
        print(f"{i}. {card['front'][:100]}")
else:
    print("No Episode 10 flashcards found")
