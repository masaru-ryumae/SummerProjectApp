import { useState, useEffect } from 'react';

export default function KanbanBoard({ teamId, onClose }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`kanban_${teamId}`);
    return saved
      ? JSON.parse(saved)
      : {
          todo: [
            {
              id: 'task_1',
              title: 'Project Setup',
              description: 'Initialize project structure',
              assignee: 'Team Lead',
              priority: 'high',
              dueDate: '2024-12-15'
            },
            {
              id: 'task_2',
              title: 'Design System',
              description: 'Create design tokens and components',
              assignee: 'Designer',
              priority: 'high',
              dueDate: '2024-12-20'
            }
          ],
          inProgress: [
            {
              id: 'task_3',
              title: 'Frontend Implementation',
              description: 'Build React components',
              assignee: 'Frontend Dev',
              priority: 'high',
              dueDate: '2024-12-25'
            }
          ],
          completed: [
            {
              id: 'task_4',
              title: 'Requirements Review',
              description: 'Review project requirements',
              assignee: 'Product Manager',
              priority: 'medium',
              dueDate: '2024-12-10'
            }
          ]
        };
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [newTaskForm, setNewTaskForm] = useState({ status: null, title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem(`kanban_${teamId}`, JSON.stringify(tasks));
  }, [tasks, teamId]);

  const handleDragStart = (task, status) => {
    setDraggedTask({ task, fromStatus: status });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (toStatus) => {
    if (!draggedTask) return;

    const { task, fromStatus } = draggedTask;

    if (fromStatus === toStatus) {
      setDraggedTask(null);
      return;
    }

    setTasks((prev) => ({
      ...prev,
      [fromStatus]: prev[fromStatus].filter((t) => t.id !== task.id),
      [toStatus]: [...prev[toStatus], task]
    }));

    setDraggedTask(null);
  };

  const handleAddTask = (status) => {
    if (!newTaskForm.title.trim()) return;

    const newTask = {
      id: `task_${Date.now()}`,
      title: newTaskForm.title,
      description: newTaskForm.description,
      assignee: 'Unassigned',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setTasks((prev) => ({
      ...prev,
      [status]: [...(prev[status] || []), newTask]
    }));

    setNewTaskForm({ status: null, title: '', description: '' });
  };

  const handleDeleteTask = (taskId, status) => {
    setTasks((prev) => ({
      ...prev,
      [status]: prev[status].filter((t) => t.id !== taskId)
    }));
  };

  const columns = [
    { key: 'todo', label: 'To Do', color: 'blue' },
    { key: 'inProgress', label: 'In Progress', color: 'yellow' },
    { key: 'completed', label: 'Completed', color: 'green' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-screen overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Board</h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-x-auto p-6">
          <div className="grid grid-cols-3 gap-6 min-w-max">
            {columns.map((column) => (
              <div
                key={column.key}
                className="w-80 flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.key)}
              >
                {/* Column Header */}
                <div className={`p-4 bg-${column.color}-100 dark:bg-${column.color}-900/30 rounded-t-lg`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {column.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tasks[column.key].length} tasks
                  </p>
                </div>

                {/* Tasks */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {tasks[column.key].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.key)}
                      className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white flex-1">
                          {task.title}
                        </h4>
                        <button
                          onClick={() => handleDeleteTask(task.id, column.key)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>

                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Task Form */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                  {newTaskForm.status === column.key ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddTask(column.key);
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        placeholder="Task title"
                        value={newTaskForm.title}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, title: e.target.value })
                        }
                        autoFocus
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-sm"
                      />
                      <textarea
                        placeholder="Description"
                        value={newTaskForm.description}
                        onChange={(e) =>
                          setNewTaskForm({ ...newTaskForm, description: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white text-sm"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTaskForm({ status: null, title: '', description: '' })}
                          className="flex-1 px-3 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded text-sm hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setNewTaskForm({ ...newTaskForm, status: column.key })}
                      className="w-full px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      + Add Task
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
