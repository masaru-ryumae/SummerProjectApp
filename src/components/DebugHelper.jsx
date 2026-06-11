import { useState } from 'react';
import debugHelperService from '../services/debugHelper';

export default function DebugHelper({ onClose }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('fixes');

  const handleAnalyzeError = () => {
    if (!errorMessage.trim()) return;
    const result = debugHelperService.analyzeError(errorMessage, stackTrace, language);
    setAnalysis(result);
  };

  const getSeverityBadgeColor = (errorType) => {
    if (errorType.includes('error')) return 'bg-red-900/30 text-red-400 border-red-700';
    if (errorType.includes('warning')) return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
    return 'bg-blue-900/30 text-blue-400 border-blue-700';
  };

  const getLikelihoodColor = (likelihood) => {
    if (likelihood >= 90) return 'bg-green-900/30 border-green-700 text-green-400';
    if (likelihood >= 75) return 'bg-blue-900/30 border-blue-700 text-blue-400';
    return 'bg-yellow-900/30 border-yellow-700 text-yellow-400';
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex">
      <div className="flex-1 flex flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Debug Helper</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-600 mb-3"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button
            onClick={handleAnalyzeError}
            disabled={!errorMessage.trim()}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded hover:from-red-700 hover:to-orange-700 disabled:opacity-50 font-medium transition-all"
          >
            🔍 Analyze Error
          </button>
        </div>

        <div className="flex-1 flex flex-col border-b border-gray-800">
          <label className="px-4 pt-4 text-sm font-medium text-gray-400">Error Message</label>
          <textarea
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="Paste your error message here..."
            className="flex-1 bg-gray-800 text-white p-4 font-mono text-sm focus:outline-none resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="px-4 pt-4 text-sm font-medium text-gray-400">Stack Trace (Optional)</label>
          <textarea
            value={stackTrace}
            onChange={(e) => setStackTrace(e.target.value)}
            placeholder="Paste your stack trace here (optional)..."
            className="flex-1 bg-gray-800 text-white p-4 font-mono text-sm focus:outline-none resize-none"
            spellCheck="false"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Analysis & Solutions</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {analysis ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
              {['fixes', 'causes', 'prevention'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-red-600 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className={`rounded-lg p-4 mb-6 border ${getSeverityBadgeColor(analysis.errorType)}`}>
                <h3 className="font-bold text-lg mb-2">{analysis.errorType}</h3>
                <p className="text-sm">{analysis.description}</p>
              </div>

              {activeTab === 'fixes' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white mb-4">Suggested Fixes</h4>
                  {analysis.suggestedFixes.map((fix, idx) => (
                    <div key={idx} className={`rounded-lg p-4 border ${getLikelihoodColor(fix.likelihood)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-bold">{fix.title}</h5>
                        <span className="text-xs font-bold">{fix.likelihood}% likely</span>
                      </div>
                      <p className="text-sm mb-3">{fix.description}</p>
                      {fix.code && (
                        <div className="bg-gray-800 rounded p-3 font-mono text-xs text-cyan-400 overflow-x-auto">
                          {fix.code}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'causes' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white mb-4">Possible Causes</h4>
                  <div className="space-y-2">
                    {analysis.possibleCauses.map((cause, idx) => (
                      <div key={idx} className="bg-gray-800 rounded-lg p-4 flex items-start gap-3 hover:bg-gray-700 transition-colors">
                        <span className="text-orange-400 font-bold">{idx + 1}.</span>
                        <p className="text-gray-300">{cause}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'prevention' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white mb-4">Prevention Best Practices</h4>
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <p className="text-green-400 font-bold mb-3">How to Prevent This Error</p>
                    <ul className="space-y-2">
                      {analysis.prevention.map((practice, idx) => (
                        <li key={idx} className="text-sm text-green-300 flex items-start gap-2">
                          <span className="text-green-500 font-bold">✓</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">🐛</p>
              <h3 className="text-xl font-bold text-white mb-2">Error Analysis</h3>
              <p className="text-gray-400 max-w-sm">
                Paste your error message on the left to get debugging help.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
