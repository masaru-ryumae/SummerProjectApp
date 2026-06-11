import React, { useState } from 'react'
const TutorialBuilder = ({ onBack }) => {
  const [tutorials, setTutorials] = useState([])
  const [showEditor, setShowEditor] = useState(false)
  const [formData, setFormData] = useState({ id: `tut_${Date.now()}`, title: '', description: '', category: 'web', difficulty: 'beginner', estimatedTime: '30', steps: [{ id: 1, title: '', content: '', type: 'text' }], seoTitle: '', seoDescription: '', seoKeywords: '', tags: [], featured: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'draft' })
  const handleSaveTutorial = () => { if (!formData.title.trim()) return; const updated = { ...formData, updatedAt: new Date().toISOString() }; setTutorials(tutorials.map(t => t.id === formData.id ? updated : t).length ? tutorials.map(t => t.id === formData.id ? updated : t) : [...tutorials, updated]); setShowEditor(false) }
  return !showEditor ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4"><div className="max-w-6xl mx-auto"><div className="mb-8"><h1 className="text-4xl font-bold">📚 Tutorial Builder</h1></div><button onClick={() => setShowEditor(true)} className="w-full mb-8 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">+ Create New Tutorial</button><button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-200">← Back</button></div></div>
  ) : null
}
export default TutorialBuilder
