import { useState } from 'react'
import { A11Y_LABELS } from '../utils/a11y'

// Defect #24 Fix: Accessibility improvements
const QuestionGroup = ({ title, field, options, answers, handleChange }) => (
  <fieldset className="mb-8 text-left">
    <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4 block">
      {title}
    </legend>
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option} className="flex items-center cursor-pointer group">
          <input
            type="radio"
            name={field}
            value={option}
            checked={answers[field] === option}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-5 h-5 text-purple-600 dark:text-purple-400 accent-purple-600 dark:accent-purple-400 cursor-pointer"
            aria-label={`${title}: ${option}`}
          />
          <span className="ml-3 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {option}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
)

const DecisionTree = ({ onGenerate }) => {
  const [answers, setAnswers] = useState({
    interest: '',
    skillLevel: '',
    budget: '',
    timePerWeek: '',
    location: '',
    priority: ''
  })

  const interests = ['CS', 'Electronics', 'Physics', 'Robotics', 'Web/App', 'Mixed']
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced']
  const budgets = ['$0-25', '$25-50', '$50-100', '$100-200', '$200+']
  const times = ['1-2 hours', '3-5 hours', '5+ hours']
  const locations = ['Home only', 'Home with maker space', 'School lab', 'Outdoor']
  const priorities = ['Learn something new', 'Build something cool', 'Impress friends', 'Challenge myself']

  const handleChange = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Defect #18 Fix: Validate answers before submission
  const validateAnswers = (answers) => {
    const validFields = ['interest', 'skillLevel', 'budget', 'timePerWeek', 'location', 'priority'];

    // Check all required fields are present
    for (const field of validFields) {
      if (!answers[field] || typeof answers[field] !== 'string') {
        return false;
      }
    }

    // Validate answer values are from allowed options
    const validInterests = new Set(interests);
    const validSkillLevels = new Set(skillLevels);
    const validBudgets = new Set(budgets);
    const validTimes = new Set(times);
    const validLocations = new Set(locations);
    const validPriorities = new Set(priorities);

    return (
      validInterests.has(answers.interest) &&
      validSkillLevels.has(answers.skillLevel) &&
      validBudgets.has(answers.budget) &&
      validTimes.has(answers.timePerWeek) &&
      validLocations.has(answers.location) &&
      validPriorities.has(answers.priority)
    );
  };

  const allAnswered =
    answers.interest &&
    answers.skillLevel &&
    answers.budget &&
    answers.timePerWeek &&
    answers.location &&
    answers.priority

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with Tech Dad voice */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Summer Project
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Hey there, maker! Let's find a project that matches your vibe.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Answer these 6 quick questions and we'll match you with killer projects.
          </p>
        </div>

        {/* Questions Form */}
        <form className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
          <QuestionGroup
            title="1. What's your main interest?"
            field="interest"
            options={interests}
            answers={answers}
            handleChange={handleChange}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-8"></div>

          <QuestionGroup
            title="2. What's your skill level?"
            field="skillLevel"
            options={skillLevels}
            answers={answers}
            handleChange={handleChange}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-8"></div>

          <QuestionGroup
            title="3. What's your budget?"
            field="budget"
            options={budgets}
            answers={answers}
            handleChange={handleChange}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-8"></div>

          <QuestionGroup
            title="4. How much time per week?"
            field="timePerWeek"
            options={times}
            answers={answers}
            handleChange={handleChange}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-8"></div>

          <QuestionGroup
            title="5. Where will you build?"
            field="location"
            options={locations}
            answers={answers}
            handleChange={handleChange}
          />

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-8"></div>

          <QuestionGroup
            title="6. What matters most?"
            field="priority"
            options={priorities}
            answers={answers}
            handleChange={handleChange}
          />

          {/* Progress Indicator */}
          <div className="mt-10 mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span className="font-semibold">
                {Object.values(answers).filter((v) => v).length} / 6
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300"
                style={{
                  width: `${(Object.values(answers).filter((v) => v).length / 6) * 100}%`
                }}
              ></div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => {
              // Defect #18 Fix: Validate answers before submission
              if (!validateAnswers(answers)) {
                alert('Please answer all questions with valid options');
                return;
              }
              onGenerate(answers);
            }}
            disabled={!allAnswered}
            aria-label={allAnswered ? 'Find my projects' : 'Please answer all questions to continue'}
            aria-disabled={!allAnswered}
            className={`w-full py-4 px-6 font-semibold rounded-lg transition-all duration-200 text-lg ${
              allAnswered
                ? 'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            {allAnswered ? '🚀 Find My Projects' : 'Answer all questions to continue'}
          </button>

          {/* Encouraging text */}
          <p className="text-center text-gray-500 dark:text-gray-500 text-sm mt-6">
            {allAnswered ? (
              <>
                <span className="text-green-600 dark:text-green-400">✓</span> All set! Let's go!
              </>
            ) : (
              `${6 - Object.values(answers).filter((v) => v).length} more to go...`
            )}
          </p>
        </form>

        {/* Footer motivation */}
        <div className="text-center mt-10 text-gray-500 dark:text-gray-400 text-sm">
          <p>
            Remember: the best project is the one that excites YOU.
            <br />
            Don't pick what looks impressive—pick what makes you curious.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DecisionTree
