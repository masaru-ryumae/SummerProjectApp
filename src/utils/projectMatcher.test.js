/**
 * Test suite for projectMatcher.js
 * Tests all three scenarios plus edge cases
 */

import { matchProjects } from './projectMatcher.js'

// Mock projects data (from projects.json)
const mockProjects = [
  {
    id: 1,
    title: 'Build a Smart Home LED Controller',
    description: 'Control RGB LEDs with Arduino and voice commands.',
    category: 'Electronics',
    skillLevel: 'Beginner',
    budget: 45,
    timeWeeks: 3,
    resourceUrl: 'https://www.arduino.cc/en/Guide/ArduinoUno',
    interests: ['Electronics', 'Home automation']
  },
  {
    id: 2,
    title: 'Physics Simulation: Gravity & Orbits',
    description: 'Build an interactive physics simulator.',
    category: 'Physics',
    skillLevel: 'Intermediate',
    budget: 0,
    timeWeeks: 4,
    resourceUrl: 'https://www.python.org/',
    interests: ['Physics', 'Simulation', 'Programming']
  },
  {
    id: 3,
    title: 'Build a Robot Arm with Servos',
    description: '3D-printed robot arm with servo motors.',
    category: 'Robotics',
    skillLevel: 'Intermediate',
    budget: 120,
    timeWeeks: 6,
    resourceUrl: 'https://www.thingiverse.com/',
    interests: ['Robotics', 'Engineering', 'Electronics']
  },
  {
    id: 4,
    title: 'Personal Portfolio Website',
    description: 'Build a stunning portfolio site with React and Tailwind.',
    category: 'Web/App',
    skillLevel: 'Intermediate',
    budget: 0,
    timeWeeks: 3,
    resourceUrl: 'https://react.dev/',
    interests: ['Web Development', 'Portfolio']
  },
  {
    id: 5,
    title: 'Weather Station with Raspberry Pi',
    description: 'Build a local weather station with sensors.',
    category: 'Electronics',
    skillLevel: 'Advanced',
    budget: 85,
    timeWeeks: 5,
    resourceUrl: 'https://www.raspberrypi.org/',
    interests: ['IoT', 'Data Science', 'Hardware']
  },
  {
    id: 6,
    title: 'ML Image Classifier App',
    description: 'Train an ML model to classify images.',
    category: 'Web/App',
    skillLevel: 'Advanced',
    budget: 25,
    timeWeeks: 7,
    resourceUrl: 'https://www.tensorflow.org/',
    interests: ['Machine Learning', 'AI', 'Web Dev']
  }
]

// Test Scenario A: Beginner + Programming + $50 budget + 3-5 hrs/week
console.log('\n========== TEST SCENARIO A ==========')
console.log('Profile: Beginner + Programming + $50 budget + 3-5 hrs/week')
const scenarioA = {
  interest: 'Programming',
  skillLevel: 'Beginner',
  budget: '$25-50',
  timePerWeek: '3-5 hours',
  location: 'Home'
}

const resultsA = matchProjects(scenarioA, mockProjects)
console.log('\nTop 3 recommendations:')
resultsA.topProjects.slice(0, 3).forEach((p, i) => {
  console.log(
    `\n${i + 1}. ${p.title} (Score: ${p.finalScore})`
  )
  console.log(`   Category: ${p.category} | Skill: ${p.skillLevel} | Budget: $${p.budget} | Time: ${p.timeWeeks} weeks`)
  console.log(`   Explanation: ${p.explanation}`)
  console.log(
    `   Breakdown - Interest: ${p.scores.interestScore}%, Budget: ${p.scores.budgetScore}%, Difficulty: ${p.scores.diffScore}%, Time: ${p.scores.timeScore}%`
  )
})

// Test Scenario B: Intermediate + Electronics + $150 budget + 5+ hrs/week
console.log('\n\n========== TEST SCENARIO B ==========')
console.log('Profile: Intermediate + Electronics + $150 budget + 5+ hrs/week')
const scenarioB = {
  interest: 'Electronics',
  skillLevel: 'Intermediate',
  budget: '$100-200',
  timePerWeek: '5+ hours',
  location: 'School lab'
}

const resultsB = matchProjects(scenarioB, mockProjects)
console.log('\nTop 3 recommendations:')
resultsB.topProjects.slice(0, 3).forEach((p, i) => {
  console.log(
    `\n${i + 1}. ${p.title} (Score: ${p.finalScore})`
  )
  console.log(`   Category: ${p.category} | Skill: ${p.skillLevel} | Budget: $${p.budget} | Time: ${p.timeWeeks} weeks`)
  console.log(`   Explanation: ${p.explanation}`)
  console.log(
    `   Breakdown - Interest: ${p.scores.interestScore}%, Budget: ${p.scores.budgetScore}%, Difficulty: ${p.scores.diffScore}%, Time: ${p.scores.timeScore}%`
  )
})

// Test Scenario C: Advanced + Robotics + $200+ budget + 5+ hrs/week
console.log('\n\n========== TEST SCENARIO C ==========')
console.log('Profile: Advanced + Robotics + $200+ budget + 5+ hrs/week')
const scenarioC = {
  interest: 'Robotics',
  skillLevel: 'Advanced',
  budget: '$200+',
  timePerWeek: '5+ hours',
  location: 'Anywhere'
}

const resultsC = matchProjects(scenarioC, mockProjects)
console.log('\nTop 3 recommendations:')
resultsC.topProjects.slice(0, 3).forEach((p, i) => {
  console.log(
    `\n${i + 1}. ${p.title} (Score: ${p.finalScore})`
  )
  console.log(`   Category: ${p.category} | Skill: ${p.skillLevel} | Budget: $${p.budget} | Time: ${p.timeWeeks} weeks`)
  console.log(`   Explanation: ${p.explanation}`)
  console.log(
    `   Breakdown - Interest: ${p.scores.interestScore}%, Budget: ${p.scores.budgetScore}%, Difficulty: ${p.scores.diffScore}%, Time: ${p.scores.timeScore}%`
  )
})

// Test edge case: Empty projects array
console.log('\n\n========== EDGE CASE: Empty Projects ==========')
const emptyResults = matchProjects(scenarioA, [])
console.log('Results with empty projects:', emptyResults)

// Test edge case: Null/undefined inputs
console.log('\n========== EDGE CASE: Null Inputs ==========')
const nullResults = matchProjects(null, mockProjects)
console.log('Results with null answers:', nullResults)

// Test results count verification
console.log('\n========== RESULTS VERIFICATION ==========')
console.log('Scenario A returned', resultsA.length, 'projects')
console.log('Scenario B returned', resultsB.length, 'projects')
console.log('Scenario C returned', resultsC.length, 'projects')

console.log('\n\n========== ALL TESTS COMPLETE ==========\n')
