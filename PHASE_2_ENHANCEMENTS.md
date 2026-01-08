# Phase 2 Enhancements - NCLEX Study Guide

## Diagnostic Data Utilization

### Current State
The onboarding diagnostic quiz (10 questions) collects:
- **Diagnostic Score** (0-100%)
- **Weak Categories** (quiz categories where user scored < 70%)
- **Study Plan** (personalized based on exam date, study hours, and diagnostic results)

**Issue:** This valuable data is currently underutilized after onboarding completes.

---

## Proposed Enhancements

### 1. Dashboard Recommendations
**Priority:** High

**Description:** Add a "Recommended for You" section on the dashboard that highlights content in weak categories.

**Features:**
- Display top 3 weak categories from diagnostic
- Show recommended quizzes/audio lessons for each weak area
- Update recommendations as user improves in those areas
- Visual indicator showing "Based on your diagnostic assessment"

**Implementation:**
- Add new section to `app/dashboard/page.tsx`
- Read `weakCategories` from `OnboardingContext`
- Filter quizzes/episodes by category
- Display as priority cards above regular content grid

---

### 2. Progress Comparison
**Priority:** Medium

**Description:** Show improvement from diagnostic score to current performance in analytics.

**Features:**
- "Your Journey" chart showing diagnostic score vs. current readiness
- Percentage improvement calculation
- Visual timeline of progress
- Motivational messages based on improvement

**Implementation:**
- Update `app/analytics/page.tsx`
- Add new section comparing `diagnosticScore` to current `readinessScore`
- Create line chart or progress visualization
- Calculate improvement percentage

---

### 3. Smart Quiz Selection
**Priority:** Medium

**Description:** Prioritize quizzes in weak categories when user navigates to quiz list.

**Features:**
- "Recommended" badge on quizzes in weak categories
- Sort quizzes with weak categories at the top
- "Focus Mode" toggle to show only weak area quizzes
- Track when weak areas are mastered (>80% on related quizzes)

**Implementation:**
- Update `app/quizzes/page.tsx`
- Add filtering/sorting logic based on `weakCategories`
- Add visual indicators for recommended quizzes
- Update weak categories as user improves

---

### 4. Adaptive Learning Path
**Priority:** Low

**Description:** Adjust content difficulty and recommendations based on diagnostic performance.

**Features:**
- Beginner path (diagnostic < 50%)
- Intermediate path (diagnostic 50-75%)
- Advanced path (diagnostic > 75%)
- Different daily task recommendations per level
- Adaptive flashcard deck selection

**Implementation:**
- Create difficulty tiers in `utils/studyPlanGenerator.ts`
- Adjust daily recommendations based on tier
- Filter flashcards by difficulty level
- Show appropriate content for user's level

---

### 5. Retake Diagnostic
**Priority:** Low

**Description:** Allow users to retake the diagnostic quiz to update their weak areas.

**Features:**
- "Retake Diagnostic" button in settings or analytics
- Compare old vs. new diagnostic scores
- Update weak categories and study plan
- Show improvement metrics

**Implementation:**
- Add retake option to analytics page
- Create new diagnostic session (different random questions)
- Update `OnboardingContext` with new results
- Regenerate study plan

---

### 6. Category Mastery Tracking
**Priority:** Medium

**Description:** Track progress in each category and celebrate when weak areas become strengths.

**Features:**
- Category-level progress bars
- "Mastered" badge when category reaches 80%+ average
- "Improved" indicator when weak category crosses 70%
- Achievement unlock for mastering all weak categories

**Implementation:**
- Add category tracking to `ProgressContext`
- Calculate per-category averages from quiz results
- Display in analytics page
- Integrate with achievement system

---

### 7. Personalized Study Reminders
**Priority:** Low

**Description:** Send notifications/reminders focused on weak areas.

**Features:**
- Daily reminder to practice weak categories
- "You haven't practiced [category] in 3 days" alerts
- Suggested study sessions based on weak areas
- Progress notifications ("You've improved in [category]!")

**Implementation:**
- Add notification system (browser notifications or in-app)
- Track last study date per category
- Create reminder logic based on weak categories
- Display in-app notifications

---

## Implementation Priority

### Phase 2A (High Priority)
1. Dashboard Recommendations
2. Progress Comparison in Analytics
3. Category Mastery Tracking

### Phase 2B (Medium Priority)
4. Smart Quiz Selection
5. Retake Diagnostic Option

### Phase 2C (Low Priority - Future)
6. Adaptive Learning Path
7. Personalized Study Reminders

---

## Technical Considerations

### Data Storage
- All diagnostic data already stored in `OnboardingContext`
- Persisted to localStorage
- No database changes needed

### Performance
- Filtering/sorting operations are lightweight
- No API calls required
- All calculations done client-side

### User Experience
- Should feel helpful, not overwhelming
- Make recommendations optional/dismissible
- Allow users to hide weak category suggestions if desired

---

## Success Metrics

Once implemented, track:
- % of users who engage with recommended content
- Improvement rate in weak categories vs. other categories
- User retention after seeing personalized recommendations
- Time to mastery for weak categories
- Overall readiness score improvement

---

## Notes

- Keep diagnostic data privacy in mind (stored locally only)
- Consider adding "Reset Diagnostic" option in settings
- May want to expire diagnostic data after 30 days and suggest retake
- Could integrate with achievement system (e.g., "Weakness Warrior" badge for mastering all weak categories)
