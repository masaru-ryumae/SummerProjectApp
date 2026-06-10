/**
 * PROJECT MATCHER - Summer Builder Project App
 *
 * Recommendation engine that matches user interests and constraints to projects.
 *
 * TEST SCENARIOS:
 *
 * Scenario A: Beginner + CS + $50 budget + 3-5 hrs/week + Home
 * Input: { interest: 'Programming', skillLevel: 'Beginner', budget: '$25-50', timePerWeek: '3-5 hours', location: 'Home' }
 * Expected: Web-based projects, zero/low budget items like Portfolio Website, Discord Bot alternatives
 *
 * Scenario B: Intermediate + Electronics + $150 budget + 5+ hrs/week + School lab
 * Input: { interest: 'Electronics', skillLevel: 'Intermediate', budget: '$100-200', timePerWeek: '5+ hours', location: 'School lab' }
 * Expected: Robot Arm with Servos, Smart Home controller, intermediate electronics projects
 *
 * Scenario C: Advanced + Robotics + $200+ budget + 5+ hrs/week + Anywhere
 * Input: { interest: 'Robotics', skillLevel: 'Advanced', budget: '$200+', timePerWeek: '5+ hours', location: 'Anywhere' }
 * Expected: Weather Station, ML Image Classifier, advanced multi-week projects
 */

/**
 * Main matching function - returns top 3 projects with explanations
 * @param {Object} answers - User's quiz responses
 * @param {string} answers.interest - Category of interest (e.g., 'Programming', 'Electronics', 'Robotics')
 * @param {string} answers.skillLevel - Skill level ('Beginner', 'Intermediate', 'Advanced')
 * @param {string} answers.budget - Budget range (e.g., '$0-25', '$25-50', '$50-100', '$100-200', '$200+')
 * @param {string} answers.timePerWeek - Time commitment ('1-2 hours', '3-5 hours', '5+ hours')
 * @param {string} answers.location - Where they'll work ('Home', 'School lab', 'Anywhere')
 * @param {string} [answers.priority] - Optional priority ('Learn', 'Build', 'Impress', 'Challenge')
 * @param {Array} allProjects - Array of project objects from projects.json
 * @returns {Object} { topProjects: Array, explanations: Array, noMatchWarning: boolean }
 */
export function matchProjects(answers, allProjects) {
  // Defensive checks
  if (!answers || !allProjects || allProjects.length === 0) {
    return {
      topProjects: [],
      explanations: [],
      noMatchWarning: true
    }
  }

  // Score each project
  const scoredProjects = allProjects.map((project) => {
    const scores = scoreProject(project, answers)
    return {
      ...project,
      finalScore: scores.score,
      scores,
      explanation: generateExplanation(project, scores)
    }
  })

  // Sort by final score (descending) and take top 3
  const topProjects = scoredProjects.sort((a, b) => b.finalScore - a.finalScore).slice(0, 3)

  // Check if these are true matches or just "closest matches"
  const hasGoodMatch = topProjects.some((p) => p.finalScore >= 70)
  const noMatchWarning = !hasGoodMatch

  return {
    topProjects,
    explanations: topProjects.map((p) => ({
      projectId: p.id,
      projectTitle: p.title,
      explanation: p.explanation,
      matchScore: Math.round(p.finalScore)
    })),
    noMatchWarning
  }
}

/**
 * Score a single project against user answers
 * @param {Object} project - Project object from projects.json
 * @param {Object} answers - User's answers
 * @returns {Object} Scores breakdown: { score, interestScore, budgetScore, diffScore, timeScore, locScore, whyMatch }
 */
export function scoreProject(project, answers) {
  // Interest match (40% weight)
  const interestScore = calculateInterestScore(project, answers.interest)

  // Budget match (30% weight)
  const budgetScore = calculateBudgetScore(project, answers.budget)

  // Difficulty match (15% weight)
  const diffScore = calculateDifficultyScore(project, answers.skillLevel)

  // Time match (10% weight)
  const timeScore = calculateTimeScore(project, answers.timePerWeek)

  // Location match (5% weight)
  const locScore = calculateLocationScore(project, answers.location)

  // Weighted final score
  const score = (interestScore * 0.4 + budgetScore * 0.3 + diffScore * 0.15 + timeScore * 0.1 + locScore * 0.05)

  // Build explanation array
  const whyMatch = []
  if (interestScore === 100) whyMatch.push('Perfect interest match')
  if (budgetScore === 100) whyMatch.push('Exactly in budget')
  if (diffScore === 100) whyMatch.push('Your exact skill level')
  if (timeScore === 100) whyMatch.push('Fits your schedule')

  return {
    score: Math.round(score),
    interestScore: Math.round(interestScore),
    budgetScore: Math.round(budgetScore),
    diffScore: Math.round(diffScore),
    timeScore: Math.round(timeScore),
    locScore: Math.round(locScore),
    whyMatch: whyMatch.length > 0 ? whyMatch : ['Good overall match']
  }
}

/**
 * Calculate interest match score (0-100)
 * Logic:
 * - 100 if project.category matches user interest
 * - 100 if any project.interests matches user interest
 * - 50 if partial category match (adjacent category)
 * - 0 otherwise
 */
function calculateInterestScore(project, userInterest) {
  if (!userInterest) return 50

  const userInterestLower = userInterest.toLowerCase()

  // Exact category match
  if (project.category && project.category.toLowerCase() === userInterestLower) {
    return 100
  }

  // Check project interests array for exact match
  if (project.interests && Array.isArray(project.interests)) {
    if (project.interests.some((i) => i.toLowerCase() === userInterestLower)) {
      return 100
    }
    // Partial match in interests
    if (project.interests.some((i) => i.toLowerCase().includes(userInterestLower.split(' ')[0]))) {
      return 75
    }
  }

  // Adjacent category matches
  const adjacentMatches = {
    'programming': ['web development', 'ai', 'machine learning', 'web/app'],
    'electronics': ['robotics', 'iot', 'hardware', 'home automation'],
    'robotics': ['electronics', 'engineering', 'mechanics'],
    'physics': ['simulation', 'mathematics'],
    'web development': ['programming', 'web/app', 'portfolio'],
    'ai': ['machine learning', 'programming']
  }

  const adjacent = adjacentMatches[userInterestLower] || []
  if (
    project.category &&
    adjacent.some((adj) => project.category.toLowerCase().includes(adj))
  ) {
    return 50
  }
  if (
    project.interests &&
    project.interests.some((i) =>
      adjacent.some((adj) => i.toLowerCase().includes(adj))
    )
  ) {
    return 50
  }

  return 0
}

/**
 * Calculate budget match score (0-100)
 * Logic:
 * - 100 if project.budget <= user budget (exact fit)
 * - 75 if within $50 over
 * - 50 if within $100 over
 * - 0 if significantly over budget
 */
function calculateBudgetScore(project, userBudgetRange) {
  if (!userBudgetRange) return 50

  const budgetRanges = {
    '$0-25': { min: 0, max: 25 },
    '$25-50': { min: 25, max: 50 },
    '$50-100': { min: 50, max: 100 },
    '$100-200': { min: 100, max: 200 },
    '$200+': { min: 200, max: 100000 }
  }

  const range = budgetRanges[userBudgetRange]
  if (!range) return 50

  const projectBudget = project.budget || 0

  // Exact fit within range
  if (projectBudget >= range.min && projectBudget <= range.max) {
    return 100
  }

  // Over budget check
  if (projectBudget > range.max) {
    const overage = projectBudget - range.max
    if (overage <= 50) return 75 // Close overage
    if (overage <= 100) return 50 // Moderate overage
    return 0 // Way over
  }

  // Under budget is good
  return 100
}

/**
 * Calculate difficulty match score (0-100)
 * Logic:
 * - 100 if exact skill level match
 * - 80 if within 1 level (Beginner-Intermediate, Intermediate-Advanced)
 * - 60 if within 2 levels
 * - 0 for very mismatched
 */
function calculateDifficultyScore(project, userSkillLevel) {
  if (!userSkillLevel || !project.skillLevel) return 50

  if (project.skillLevel === userSkillLevel) {
    return 100
  }

  const levels = ['Beginner', 'Intermediate', 'Advanced']
  const userIndex = levels.indexOf(userSkillLevel)
  const projectIndex = levels.indexOf(project.skillLevel)

  if (userIndex === -1 || projectIndex === -1) return 50

  const distance = Math.abs(userIndex - projectIndex)

  if (distance === 1) return 80 // One level apart
  if (distance === 2) return 60 // Two levels apart

  return 50 // Very far apart
}

/**
 * Calculate time match score (0-100)
 * Assumes 8 weeks of summer availability
 * Logic:
 * - 100 if project.timeWeeks fits comfortably within user availability
 * - 75 if tight fit but doable
 * - 50 if challenging but possible
 */
function calculateTimeScore(project, userTimePerWeek) {
  if (!userTimePerWeek) return 50

  const timeRanges = {
    '1-2 hours': { hoursPerWeek: 2, maxProjectWeeks: 4 },
    '3-5 hours': { hoursPerWeek: 5, maxProjectWeeks: 6 },
    '5+ hours': { hoursPerWeek: 8, maxProjectWeeks: 8 }
  }

  const range = timeRanges[userTimePerWeek]
  if (!range) return 50

  const projectTimeWeeks = project.timeWeeks || 0

  // Assume 8 weeks of summer available
  const availableWeeks = 8

  // Perfect fit - project fits within their time constraints
  if (projectTimeWeeks <= range.maxProjectWeeks) {
    return 100
  }

  // Tight fit - can do it but requires intense focus
  if (projectTimeWeeks <= availableWeeks) {
    return 75
  }

  // Challenging - would need summer extension or reduced scope
  if (projectTimeWeeks <= availableWeeks + 2) {
    return 50
  }

  // Too long for summer
  return 0
}

/**
 * Calculate location match score (0-100)
 * Logic:
 * - 100 if exact location match
 * - 75 if close match (e.g., anywhere includes home/lab)
 * - 50 if requires setup at alternative location
 */
function calculateLocationScore(project, userLocation) {
  // If user says "Anywhere", they're flexible
  if (userLocation && userLocation.toLowerCase() === 'anywhere') {
    return 100
  }

  if (!userLocation) return 75

  // Most projects don't have location requirements in our data
  // So default to good score (75) unless explicitly conflicting
  // This could be enhanced if projects included location requirements

  return 75
}

/**
 * Generate friendly explanation text with Tech Dad voice
 * @param {Object} project - Project object
 * @param {Object} scores - Scores from scoreProject
 * @returns {string} Friendly explanation message
 */
export function generateExplanation(project, scores) {
  const parts = []

  // Start with category match
  if (scores.interestScore === 100) {
    parts.push(`Perfect for your ${project.category} interest`)
  } else if (scores.interestScore >= 75) {
    parts.push(`Great ${project.category} project`)
  } else if (scores.interestScore >= 50) {
    parts.push(`Interesting ${project.category} challenge`)
  }

  // Add budget note
  if (scores.budgetScore === 100) {
    parts.push(`only $${project.budget} to build`)
  } else if (scores.budgetScore >= 75) {
    parts.push(`fits in your budget`)
  }

  // Add difficulty note
  if (scores.diffScore === 100) {
    parts.push(`just right for a ${project.skillLevel}`)
  } else if (scores.diffScore >= 80) {
    parts.push(`good stretch for a ${project.skillLevel}`)
  }

  // Add time note
  if (scores.timeScore === 100) {
    parts.push(`doable in ${project.timeWeeks} weeks`)
  } else if (scores.timeScore >= 75) {
    parts.push(`fits your schedule`)
  }

  // Build message with Tech Dad energy
  if (parts.length === 0) {
    return `This is a solid match for you! ${project.title} will be fun and educational.`
  }

  if (parts.length === 1) {
    return `Great choice! ${parts[0]}.`
  }

  if (parts.length === 2) {
    return `${parts[0]}, and ${parts[1]}!`
  }

  // 3+ parts
  return `${parts[0]}, ${parts.slice(1, -1).join(', ')}, and ${parts[parts.length - 1]}!`
}

/**
 * Handle edge cases in matching
 * @param {Array} allProjects - All available projects
 * @param {Object} answers - User answers
 * @returns {Object} Results with edge case handling
 */
export function handleEdgeCases(allProjects, answers) {
  const results = matchProjects(answers, allProjects)

  // If no good matches found, add note
  if (results.noMatchWarning && results.topProjects.length > 0) {
    return {
      ...results,
      edgeCaseNote:
        "These are your closest matches. No perfect matches available, but we think you'll enjoy these!"
    }
  }

  // Check for perfect matches
  if (results.topProjects[0] && results.topProjects[0].finalScore >= 95) {
    return {
      ...results,
      edgeCaseNote: 'Perfect match for you! This project is made for exactly what you asked for.'
    }
  }

  return results
}
