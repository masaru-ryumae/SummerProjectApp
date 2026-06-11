import { useState, useCallback } from 'react';
import { useDebouncedCallback } from '../utils/debounce';
import TemplateGallery from './TemplateGallery';
import TutorialLibrary from './TutorialLibrary';
import CreatorPortal from './CreatorPortal';

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');

  // Defect #15 Fix: Debounce search to prevent excessive re-renders
  const handleSearchChange = useDebouncedCallback((value) => {
    setSearchQuery(value);
  }, 300); // 300ms debounce

  const tabs = [
    { id: 'templates', label: '📦 Templates', icon: '📦' },
    { id: 'tutorials', label: '📚 Tutorials', icon: '📚' },
    { id: 'creators', label: '👨‍💻 Creator Program', icon: '👨‍💻' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Summer Project Marketplace
          </h1>
          <p className="text-blue-100 text-lg">
            Discover templates, learn from tutorials, and share your creations
          </p>

          {/* Search Bar */}
          <div className="mt-8">
            <input
              type="text"
              placeholder="Search templates, tutorials, and creators..."
              defaultValue={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-6 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'templates' && (
          <TemplateGallery searchQuery={searchQuery} />
        )}
        {activeTab === 'tutorials' && (
          <TutorialLibrary searchQuery={searchQuery} />
        )}
        {activeTab === 'creators' && (
          <CreatorPortal />
        )}
      </div>
    </div>
  );
}
