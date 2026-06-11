import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

const TutorialBuilder = ({ onBack }) => {
  const { currentUser } = useApp()
  const [tutorials, setTutorials] = useState([])
  const [editing, setEditing] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    category: 'web',
    difficulty: 'beginner',
    estimatedTime: '30',
    steps: [{ id: 1, title: '', content: '', type: 'text' }],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    tags: [],
    featured: false,
    createdAt: null,
    updatedAt: null,
    status: 'draft'
  })

  const handleNewTutorial = () => {
    setFormData({
      id: `tut_${Date.now()}`,
      title: '',
      description: '',
      category: 'web',
      difficulty: 'beginner',
      estimatedTime: '30',
      steps: [{ id: 1, title: '', content: '', type: 'text' }],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      tags: [],
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    })
    setEditing(null)
    setShowEditor(true)
  }

  const handleSaveTutorial = () => {
    if (!formData.title.trim() || formData.steps.some(s => !s.title.trim())) {
      alert('Please fill in title and all step titles')
      return
    }
    const updatedTutorial = { ...formData, updatedAt: new Date().toISOString() }
    if (editing) {
      setTutorials(tutorials.map(t => t.id === editing ? updatedTutorial : t))
    } else {
      setTutorials([...tutorials, updatedTutorial])
    }
    setShowEditor(false)
    setEditing(null)
  }

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { id: formData.steps.length + 1, title: '', content: '', type: 'text' }]
    })
  }

  const handleRemoveStep = (index) => {
    if (formData.steps.length > 1) {
      setFormData({
        ...formData,
        steps: formData.steps.filter((_, i) => i !== index)
      })
    }
  }

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData({ ...formData, steps: newSteps })
  }

  const handleDeleteTutorial = (id) => {
    setTutorials(tutorials.filter(t => t.id !== id))
  }

  if (!showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                📚 Tutorial Builder
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage step-by-step tutorials with code blocks and interactive content
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              ← Back
            </button>
          </div>

          <button
            onClick={handleNewTutorial}
            className="w-full mb-8 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-lg transition-all"
          >
            + Create New Tutorial
          </button>

          {tutorials.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No tutorials yet. Create your first tutorial to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tutorial.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {tutorial.steps.length} steps • {tutorial.estimatedTime} min
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tutorial.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                      {tutorial.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{tutorial.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(tutorial)
                        setEditing(tutorial.id)
                        setShowEditor(true)
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTutorial(tutorial.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {editing ? '✏️ Edit Tutorial' : '📝 Create New Tutorial'}
          </h1>
          <button
            onClick={() => {
              setShowEditor(false)
              setEditing(null)
            }}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            ✕ Close
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tutorial Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build a React Todo App"
              className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will users learn from this tutorial?"
              rows="3"
              className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option>web</option>
                <option>mobile</option>
                <option>ai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option>beginner</option>
                <option>intermediate</option>
                <option>advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Time (min)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Steps ({formData.steps.length})
            </h2>
            <div className="space-y-4 mb-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      Step {index + 1}
                    </span>
                    {formData.steps.length > 1 && (
                      <button
                        onClick={() => handleRemoveStep(index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    placeholder="Step title"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-3"
                  />
                  <textarea
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    placeholder="Step content..."
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleAddStep}
              className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              + Add Step
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveTutorial}
              className="flex-1 px-6 py-3 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
            >
              💾 Save as Draft
            </button>
            <button
              onClick={handleSaveTutorial}
              className="flex-1 px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
            >
              🚀 Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorialBuilder
