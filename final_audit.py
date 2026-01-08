import json
import os
import re

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def check_system():
    episodes = load_json('app/data/episodes.json')
    quizzes = load_json('app/data/quizzes.json')
    flashcards = load_json('app/data/flashcards.json')
    
    # Check Transcripts registry
    with open('app/data/transcripts.ts', 'r', encoding='utf-8') as f:
        ts_content = f.read()
    
    print(f"--- SYSTEM AUDIT REPORT ---\n")
    
    issues = []
    
    for ep in episodes:
        ep_id = ep['id']
        title = ep['title']
        print(f"Checking Episode {ep_id}: {title}")
        
        # 1. QUIZZES
        ep_quizzes = [q for q in quizzes if q.get('episodeId') == ep_id]
        if ep_id <= 14:
            if not ep_quizzes:
                issues.append(f"❌ Ep {ep_id} MISSING quizzes (Expected present)")
            else:
                print(f"  - Quizzes: {[q['title'] for q in ep_quizzes]}")
        else: # Ep 15, 16
            if ep_quizzes:
                issues.append(f"❌ Ep {ep_id} HAS quizzes (Expected NONE): {[q['title'] for q in ep_quizzes]}")
            else:
                print(f"  - Quizzes: None (Correct)")

        # 2. FLASHCARDS
        ep_cards = [f for f in flashcards if f.get('episodeId') == ep_id]
        if ep_id <= 14:
            if not ep_cards:
                 issues.append(f"❌ Ep {ep_id} MISSING flashcards")
            else:
                print(f"  - Flashcards: Found ({len(ep_cards[0]['cards'])} cards)")
        else:
             if ep_cards:
                 print(f"  - Flashcards: Found (Optional for 15/16)")

        # 3. TRANSCRIPTS
        if f"{ep_id}: episode{ep_id}Data" not in ts_content:
             issues.append(f"❌ Ep {ep_id} missing from transcripts.ts registry")
        else:
            print(f"  - Transcript: Registered")
            
        print("")

    # 4. ORPHANED QUIZZES
    orphaned_quizzes = [q for q in quizzes if q.get('episodeId') and q.get('episodeId') > 16]
    if orphaned_quizzes:
        issues.append(f"⚠️ Orphaned Quizzes found (ID > 16): {orphaned_quizzes}")

    print("--- SUMMARY ---")
    if issues:
        print("\n".join(issues))
        print("\nFixing simple issues automatically...")
    else:
        print("✅ All systems go. No issues found.")

if __name__ == "__main__":
    check_system()
