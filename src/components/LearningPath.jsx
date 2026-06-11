import { useState } from 'react';
import learningPathService from '../services/learningPath';

export default function LearningPath({ onClose }) {
  const [goal, setGoal] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);

  const handleGeneratePath = () => {
    if (!goal.trim()) return;
    const skills = currentSkills.split(',').map((s) => s.trim()).filter((s) => s);
    const path = learningPathService.generateLearningPath(goal, skills);
    setLearningPaths([path, ...learningPaths]);
    setSelectedPath(path);
    setGoal('');
    setCurrentSkills('');
  };

  const handleToggleStepComplete = (stepNumber) => {
    if (!selectedPath) return;
    learningPathService.completeStep(selectedPath.id, stepNumber);
    const updated = learningPathService.getLearningPath(selectedPath.id);
    if (updated) {
      setSelectedPath(updated);
    }
  };

  const getProgress = () => {
    if (!selectedPath) return { completed: 0, total: 0, percentage: 0 };
    return learningPathService.getProgress(selectedPath.id);
  };

  const handleExportPath = () => {
    if (!selectedPath) return;
    const markdown = learningPathService.exportAsMarkdown(selectedPath.id);
    if (markdown) {
      const blob = new Blob([markdown], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedPath.goal}-learning-path.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const progress = getProgress();

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex">
      <div className="w-80 flex flex-col bg-gray-900 border-r border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Learning Path</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGeneratePath()}
              placeholder="e.g., React, Python"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
            />
            <input
              type="text"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="Current skills (comma-separated)"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
            />
            <button
              onClick={handleGeneratePath}
              disabled={!goal.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-medium transition-all"
            >
              🚀 Generate Path
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {learningPaths.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <p className="text-3xl mb-2">📚</p>
              <p className="text-sm">Create a learning path to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {learningPaths.map((path) => {
                const pathProgress = learningPathService.getProgress(path.id);
                return (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPath?.id === path.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <p className="font-bold mb-1">{path.goal}</p>
                    <p className="text-xs opacity-75">{path.steps.length} steps</p>
                    <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-600 to-blue-600 transition-all"
                        style={{ width: `${pathProgress.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">{pathProgress.percentage}% complete</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">{selectedPath?.goal}</h3>
            <p className="text-sm text-gray-400 mt-1">
              Estimated: {selectedPath?.estimatedDays} days
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {selectedPath ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Difficulty</p>
                  <p className={`text-lg font-bold ${
                    selectedPath.difficulty === 'beginner' ? 'text-green-400' :
                    selectedPath.difficulty === 'intermediate' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {selectedPath.difficulty.charAt(0).toUpperCase() + selectedPath.difficulty.slice(1)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Progress</p>
                  <p className="text-lg font-bold text-purple-400">{progress.percentage}%</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Steps</p>
                  <p className="text-lg font-bold text-cyan-400">{progress.completed}/{progress.total}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Time</p>
                  <p className="text-lg font-bold text-pink-400">{selectedPath.estimatedDays}d</p>
                </div>
              </div>

              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>

              <button
                onClick={handleExportPath}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium transition-colors"
              >
                📥 Export as Markdown
              </button>
            </div>

            {selectedPath.prerequisites.length > 0 && (
              <div className="p-6 border-b border-gray-800">
                <h4 className="font-bold text-white mb-3">📋 Prerequisites</h4>
                <div className="space-y-2">
                  {selectedPath.prerequisites.map((prereq, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-300">
                      <span className="text-orange-400">✓</span>
                      <span>{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 border-b border-gray-800">
              <h4 className="font-bold text-white mb-4">📖 Learning Steps</h4>
              <div className="space-y-3">
                {selectedPath.steps.map((step) => (
                  <div key={step.id} className="border border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 transition-colors text-left flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={step.completed}
                            onChange={() => handleToggleStepComplete(step.number)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded cursor-pointer"
                          />
                          <div>
                            <h5 className={`font-bold ${step.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                              Step {step.number}: {step.title}
                            </h5>
                            <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-400 ml-4">{expandedStep === step.id ? '▼' : '▶'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">🗺️</p>
              <h3 className="text-xl font-bold text-white mb-2">Learning Path Generator</h3>
              <p className="text-gray-400 max-w-sm">
                Create a personalized learning path for any skill.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
