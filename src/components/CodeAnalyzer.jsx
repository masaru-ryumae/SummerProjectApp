import { useState } from 'react';
import codeAnalyzerService from '../services/codeAnalyzer';

export default function CodeAnalyzer({ onClose }) {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('issues');

  const handleAnalyze = () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    try {
      setAnalysis(codeAnalyzerService.analyzeCode(code, filename));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex">
      <div className="flex-1 flex flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Code Analyzer</h2>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Filename (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-600 mb-3"
          />
          <button
            onClick={handleAnalyze}
            disabled={!code.trim() || isAnalyzing}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-medium disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Code'}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="flex-1 bg-gray-800 text-white p-4 font-mono text-sm focus:outline-none resize-none"
          spellCheck="false"
        />
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          <p>{code.split('\n').length} lines · {code.length} characters</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {analysis ? `${analysis.language.toUpperCase()} Analysis` : 'Results'}
          </h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white">✕</button>
        </div>

        {analysis ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex border-b border-gray-800 bg-gray-900 sticky top-0">
              {['issues', 'complexity', 'quality'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 ${
                    activeTab === tab ? 'border-purple-600 text-purple-400' : 'border-transparent text-gray-400'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'issues' && (
                <div>
                  {analysis.issues.length === 0 ? (
                    <p className="text-center text-gray-400">✨ No issues found!</p>
                  ) : (
                    <div className="space-y-3">
                      {analysis.issues.map((issue) => (
                        <div key={issue.id} className="p-4 rounded border border-gray-700 bg-gray-800">
                          <h4 className="font-bold text-white">{issue.message}</h4>
                          <p className="text-xs text-gray-400 mt-1">Line {issue.line}</p>
                          {issue.suggestion && <p className="text-sm mt-2">💡 {issue.suggestion}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'complexity' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Cyclomatic</p>
                    <p className="text-3xl font-bold text-cyan-400">{analysis.complexity.cyclomatic}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Nesting</p>
                    <p className="text-3xl font-bold text-cyan-400">{analysis.complexity.nestingLevel}</p>
                  </div>
                </div>
              )}

              {activeTab === 'quality' && (
                <div>
                  <div className="bg-gray-800 rounded-lg p-6">
                    <p className="text-sm text-gray-400 mb-4">Overall Score</p>
                    <p className="text-4xl font-bold text-purple-400">{analysis.quality.score}/100</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">📝</p>
              <h3 className="text-xl font-bold text-white mb-2">Code Analysis</h3>
              <p className="text-gray-400 max-w-sm">Paste code and click Analyze</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
