# Project Matcher Implementation Guide

## Files

### projectMatcher.js (Main Implementation)
Location: `/Users/mryumae/codes/claude/SummerProjectApp/src/utils/projectMatcher.js`

Exported functions:
1. `matchProjects(answers, allProjects)` - Main recommendation engine
2. `scoreProject(project, answers)` - Individual project scoring
3. `generateExplanation(project, scores)` - Friendly explanations
4. `handleEdgeCases(allProjects, answers)` - Edge case wrapper

### projectMatcher.test.js (Test Suite)
Location: `/Users/mryumae/codes/claude/SummerProjectApp/src/utils/projectMatcher.test.js`

Run tests:
```bash
node src/utils/projectMatcher.test.js
```

## Usage Example

```javascript
import { matchProjects } from './utils/projectMatcher.js'
import projects from './data/projects.json'

const userAnswers = {
  interest: 'Electronics',
  skillLevel: 'Intermediate',
  budget: '$100-200',
  timePerWeek: '5+ hours',
  location: 'School lab'
}

const recommendations = matchProjects(userAnswers, projects)

// Output:
// {
//   topProjects: [projectObj1, projectObj2, projectObj3],
//   explanations: [
//     { projectId: 3, projectTitle: "Build a Robot Arm...", explanation: "Perfect for...", matchScore: 99 },
//     ...
//   ],
//   noMatchWarning: false
// }
```

## Scoring Algorithm

Each project receives a weighted score:

```
Final Score = (Interest × 0.40) + (Budget × 0.30) + (Difficulty × 0.15) + (Time × 0.10) + (Location × 0.05)
```

### Interest Score (40%)
- 100: Exact category/interest match
- 75: Partial or adjacent match
- 50: Related field
- 0: No match

### Budget Score (30%)
- 100: Within or under budget
- 75: Within $50 over
- 50: Within $100 over
- 0: Significantly over

### Difficulty Score (15%)
- 100: Exact skill level match
- 80: Within 1 level
- 60: Within 2 levels
- 50+: Helpful fallback

### Time Score (10%)
- 100: Fits within recommended hours × 8 weeks
- 75: Tight fit (complete in 8 weeks)
- 50: Challenging but possible
- 0: Too long for summer

### Location Score (5%)
- 100: Exact match or "Anywhere"
- 75: Default/flexible
- 50: Requires alternative setup

## Key Features

✓ Deterministic scoring (same inputs always produce same outputs)
✓ Handles edge cases (null inputs, empty arrays, no good matches)
✓ Friendly explanations with encouraging tone ("Tech Dad voice")
✓ Defensive programming with null checks throughout
✓ No external dependencies
✓ O(n) performance - scales efficiently with project count

## Test Scenarios

All three scenarios pass with expected results:

**Scenario A**: Beginner + Programming + $50 budget
- Expected: Web-based low-budget projects
- Actual: Physics Simulation (96), Portfolio Website (76), ML Classifier (70)

**Scenario B**: Intermediate + Electronics + $150 budget + 5+ hours
- Expected: Electronics/Robotics at intermediate level
- Actual: Robot Arm (99), Smart Home LED (96), Weather Station (96)

**Scenario C**: Advanced + Robotics + $200+ budget
- Expected: Advanced robotics/electronics projects
- Actual: Robot Arm (97), Weather Station (80), Smart Home LED (74)

## Edge Cases Handled

1. Empty projects array → Returns empty topProjects with warning
2. Null/undefined inputs → Safe return with warning flag
3. No good matches (all scores < 70) → Flags noMatchWarning: true
4. Perfect matches (score >= 95) → Adds special acknowledgment
5. Budget-constrained users → Budget weighting prioritized

## Integration with App.jsx

When ready to integrate:

```javascript
import { matchProjects } from './utils/projectMatcher.js'
import projects from './data/projects.json'

// In your component:
const handleQuizSubmit = (answers) => {
  const recommendations = matchProjects(answers, projects)
  setRecommendations(recommendations)
}
```

The function returns objects ready for React rendering with all needed properties included.
