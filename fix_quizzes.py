import json

def fix_quizzes():
    file_path = 'app/data/quizzes.json'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            quizzes = json.load(f)
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        return

    new_quizzes = []
    ids_seen = set()
    cleaned_count = 0
    updated_count = 0

    print(f"Total quizzes before: {len(quizzes)}")

    for q in quizzes:
        q_id = q.get('id')
        title = q.get('title')
        episode_id = q.get('episodeId')

        # Logic for ID 5 Conflict
        if q_id == 5:
            if title == "Maternity & OB Nursing":
                # KEEP and UPDATE
                print(f"Updating Maternity Quiz (ID 5 -> 55, Ep -> 5)")
                q['id'] = 55
                q['episodeId'] = 5
                new_quizzes.append(q)
                updated_count += 1
                continue
            elif title == "Psychosocial Integrity (Unassigned)":
                # DELETE
                print(f"Removing Duplicate: {title} (ID {q_id})")
                cleaned_count += 1
                continue
            # If there are other ID 5s (unexpected), we might default to keeping or reviewing.
            # But based on analysis, these are the two.
            
        # Logic for other Legacy Unassigned Quizzes (IDs 6-14)
        # We only delete if they match the pattern of being legacy duplicates (None episode).
        if q_id in [6, 7, 8, 9, 10, 11, 12, 13, 14] and episode_id is None:
             print(f"Removing Legacy Quiz: {title} (ID {q_id})")
             cleaned_count += 1
             continue

        # Keep all others
        new_quizzes.append(q)

    # Re-verify IDs are unique
    final_ids = [q['id'] for q in new_quizzes]
    if len(final_ids) != len(set(final_ids)):
        print("WARNING: Duplicate IDs still exist after cleanup!")
        from collections import Counter
        print(Counter(final_ids).most_common(5))
    
    print(f"Total quizzes after: {len(new_quizzes)}")
    print(f"Cleaned: {cleaned_count}")
    print(f"Updated: {updated_count}")

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(new_quizzes, f, indent=4)
        
    print("Successfully saved quizzes.json")

if __name__ == "__main__":
    fix_quizzes()
