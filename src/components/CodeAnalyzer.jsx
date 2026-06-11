import { useState } from 'react';
import codeAnalyzerService from '../services/codeAnalyzer';

export default function CodeAnalyzer({ onClose }) {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('issues');

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = codeAnalyzerService.analyzeCode(code, filename);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-900/20 text-red-400 border-red-700';
      case 'warning':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700';
      case 'info':
        return 'bg-blue-900/20 text-blue-400 border-blue-700';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getComplexityColor = (value, max) => {
    const ratio = value / max;
    if (ratio > 0.7) return 'text-red-400';
    if (ratio > 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex">
      <div className="flex-1 flex flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Code Analyzer</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Filename (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
            />
            <button
              onClick={handleAnalyze}
              disabled={!code.trim() || isAnalyzing}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-medium transition-all"
            >
              {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Code'}
            </button>
          </div>
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
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {analysis ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
              {['issues', 'complexity', 'quality', 'performance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-purple-600 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'issues' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔴</span>
                      <div>
                        <p className="text-sm text-gray-400">Errors</p>
                        <p className="text-2xl font-bold text-red-400">
                          {analysis.issues.filter((i) => i.severity === 'error').length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🟡</span>
                      <div>
                        <p className="text-sm text-gray-400">Warnings</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {analysis.issues.filter((i) => i.severity === 'warning').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {analysis.issues.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-2xl mb-2">✨</p>
                      <p className="text-gray-400">No issues found!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysis.issues.map((issue) => (
                        <div key={issue.id} className={`p-4 rounded border border-gray-700 ${getSeverityColor(issue.severity)}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold">{issue.message}</h4>
                            <span className="text-xs opacity-75">
                              Line {issue.line}
                            </span>
                          </div>
                          {issue.suggestion && (
                            <p className="text-sm mt-2">💡 {issue.suggestion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'complexity' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Cyclomatic Complexity</p>
                      <p className={`text-3xl font-bold ${getComplexityColor(analysis.complexity.cyclomatic, 15)}`}>
                        {analysis.complexity.cyclomatic}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Max Nesting Level</p>
                      <p className={`text-3xl font-bold ${getComplexityColor(analysis.complexity.nestingLevel, 8)}`}>
                        {analysis.complexity.nestingLevel}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Cognitive Complexity</p>
                      <p className={`text-3xl font-bold ${getComplexityColor(analysis.complexity.cognitive, 20)}`}>
                        {analysis.complexity.cognitive}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Lines of Code</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {analysis.complexity.linesOfCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'quality' && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <p className="text-sm text-gray-400 mb-4">Overall Quality Score</p>
                    <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-green-600 to-blue-600 transition-all duration-500"
                        style={{ width: `${analysis.quality.score}%` }}
                      ></div>
                    </div>
                    <p className="text-2xl font-bold text-white">{analysis.quality.score}/100</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-2 uppercase">Maintainability</p>
                      <p className="text-2xl font-bold text-blue-400">{analysis.quality.maintainability}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-2 uppercase">Testability</p>
                      <p className="text-2xl font-bold text-purple-400">{analysis.quality.testability}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-2 uppercase">Documentation</p>
                      <p className="text-2xl font-bold text-pink-400">{analysis.quality.documentation}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Time Complexity</p>
                    <p className="text-3xl font-bold text-cyan-400">{analysis.performance.timeComplexity}</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Space Complexity</p>
                    <p className="text-3xl font-bold text-purple-400">{analysis.performance.spaceComplexity}</p>
                  </div>

                  {analysis.performance.optimizations.length > 0 && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <p className="font-bold text-green-400 mb-3">💡 Suggestions</p>
                      <ul className="space-y-2">
                        {analysis.performance.optimizations.map((opt, idx) => (
                          <li key={idx} className="text-sm text-green-300">• {opt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">📝</p>
              <h3 className="text-xl font-bold text-white mb-2">Code Analysis</h3>
              <p className="text-gray-400 max-w-sm">
                Paste your code on the left and analyze it for issues, complexity, and quality metrics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
