import { useState } from 'react';
import debugHelperService from '../services/debugHelper';

export default function DebugHelper({ onClose }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('fixes');

  const handleAnalyzeError = () => {
    if (!errorMessage.trim()) return;
    setAnalysis(debugHelperService.analyzeError(errorMessage, '', language));
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex">
      <div className="flex-1 flex flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Debug Helper</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none mb-3"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
          <button
            onClick={handleAnalyzeError}
            disabled={!errorMessage.trim()}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded font-medium disabled:opacity-50"
          >
            🔍 Analyze Error
          </button>
        </div>
        <textarea
          value={errorMessage}
          onChange={(e) => setErrorMessage(e.target.value)}
          placeholder="Paste your error message here..."
          className="flex-1 bg-gray-800 text-white p-4 font-mono text-sm focus:outline-none resize-none"
          spellCheck="false"
        />
      </div>

      <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Analysis</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-800 text-gray-400">✕</button>
        </div>

        {analysis ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex border-b border-gray-800 bg-gray-900 sticky top-0">
              {['fixes', 'causes', 'prevention'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 ${
                    activeTab === tab ? 'border-red-600 text-red-400' : 'border-transparent text-gray-400'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="rounded-lg p-4 bg-red-900/20 border border-red-700 mb-6">
                <h3 className="font-bold text-lg text-red-400">{analysis.errorType}</h3>
                <p className="text-sm text-gray-300 mt-2">{analysis.description}</p>
              </div>

              {activeTab === 'fixes' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white mb-4">Suggested Fixes</h4>
                  {analysis.suggestedFixes.map((fix, idx) => (
                    <div key={idx} className="rounded-lg p-4 bg-gray-800 border border-gray-700">
                      <h5 className="font-bold text-white">{fix.title}</h5>
                      <p className="text-sm text-gray-300 mt-2">{fix.description}</p>
                      {fix.code && <p className="text-xs text-cyan-400 mt-2 font-mono">{fix.code}</p>}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'causes' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white mb-4">Possible Causes</h4>
                  {analysis.possibleCauses.map((cause, idx) => (
                    <div key={idx} className="p-4 bg-gray-800 rounded">
                      <p className="text-gray-300"><span className="text-orange-400 font-bold">{idx + 1}. </span>{cause}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'prevention' && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <p className="text-green-400 font-bold mb-3">Prevention Best Practices</p>
                  <ul className="space-y-2">
                    {analysis.prevention.map((practice, idx) => (
                      <li key={idx} className="text-sm text-green-300 flex gap-2">
                        <span>✓</span>{practice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">🐛</p>
              <h3 className="text-xl font-bold text-white mb-2">Error Analysis</h3>
              <p className="text-gray-400 max-w-sm">Paste your error message to get debugging help</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
