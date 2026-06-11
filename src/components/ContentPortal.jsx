import React, { useState } from 'react'
const ContentPortal = ({ onBack }) => <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4"><div className="max-w-6xl mx-auto"><h1 className="text-4xl font-bold">📋 Content Management System</h1><button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-200">← Back</button></div></div>
export default ContentPortal
