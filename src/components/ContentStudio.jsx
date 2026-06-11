import React, { useState } from 'react'
import TutorialBuilder from './TutorialBuilder'
import DocGenerator from './DocGenerator'
import ContentPortal from './ContentPortal'
import CommunityContent from './CommunityContent'
const ContentStudio = ({ onBack }) => {
  const [activeModule, setActiveModule] = useState(null)
  if (activeModule === 'tutorials') return <TutorialBuilder onBack={() => setActiveModule(null)} />
  if (activeModule === 'docs') return <DocGenerator onBack={() => setActiveModule(null)} />
  if (activeModule === 'cms') return <ContentPortal onBack={() => setActiveModule(null)} />
  if (activeModule === 'community') return <CommunityContent onBack={() => setActiveModule(null)} />
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4"><div className="max-w-7xl mx-auto"><div className="mb-16"><h1 className="text-5xl font-bold">🎨 Content Studio</h1><p className="text-xl">Complete content management platform</p><button onClick={onBack} className="px-6 py-3 rounded-lg bg-gray-200">← Back</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div onClick={() => setActiveModule('tutorials')} className="cursor-pointer p-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><h2 className="text-3xl font-bold">📚 Tutorial Builder</h2><p>Create tutorials with code blocks and SEO</p></div><div onClick={() => setActiveModule('docs')} className="cursor-pointer p-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white"><h2 className="text-3xl font-bold">📖 Doc Generator</h2><p>Auto-generate API docs and guides</p></div><div onClick={() => setActiveModule('cms')} className="cursor-pointer p-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white"><h2 className="text-3xl font-bold">📋 Content Portal</h2><p>Draft, review, publish workflow</p></div><div onClick={() => setActiveModule('community')} className="cursor-pointer p-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white"><h2 className="text-3xl font-bold">👥 Community</h2><p>User submissions and rewards</p></div></div></div></div>
  )
}
export default ContentStudio
