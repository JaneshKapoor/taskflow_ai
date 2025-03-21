import React, { useEffect, useState } from "react";

const UserTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"

  useEffect(() => {
    // Load all projects from localStorage
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      // Flatten all tasks from all projects into a single array
      const allTasks = projects.reduce((acc, project) => {
        return [...acc, ...project.tasks.map(task => ({
          ...task,
          projectName: project.name,
          projectId: project.id
        }))];
      }, []);
      setAllTasks(allTasks);
    }
  }, []);

  const handleEdit = (task) => {
    setEditTaskId(task.id);
    setEditedTask(task);
    setShowEditDialog(true);
  };

  const handleDelete = (taskId, projectId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Get all projects from localStorage
      const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      
      // Remove the task from the correct project
      const updatedProjects = savedProjects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: project.tasks.filter(task => task.id !== taskId)
          };
        }
        return project;
      });

      // Save back to localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      // Update local state
      setAllTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  };

  const handleSaveEdit = () => {
    // Get all projects from localStorage
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // Update the task in the correct project
    const updatedProjects = savedProjects.map(project => {
      if (project.id === editedTask.projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => 
            task.id === editTaskId ? editedTask : task
          )
        };
      }
      return project;
    });

    // Save back to localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    // Update local state
    setAllTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === editTaskId ? editedTask : task
      )
    );

    setShowEditDialog(false);
    setEditTaskId(null);
  };

  const handleChange = (e, field) => {
    setEditedTask({ ...editedTask, [field]: e.target.value });
  };

  const handleCompleteTask = (taskId, projectId) => {
    // Get all projects from localStorage
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // Update the task in the correct project
    const updatedProjects = savedProjects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        };
      }
      return project;
    });

    // Save back to localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    // Update local state
    setAllTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const filteredTasks = allTasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="p-6 bg-[#152029] min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === "all" 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setFilter("all")}
          >
            All Tasks
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === "active" 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setFilter("active")}
          >
            Active Tasks
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === "completed" 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed Tasks
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No tasks found.</p>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-lg shadow-md transition-all duration-200 ${
                task.completed 
                  ? 'bg-green-900/50 border border-green-500/30' 
                  : 'bg-[#1a2a3a] border border-gray-700 hover:border-blue-500/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                    {task.name}
                  </p>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <span>📁</span> {task.projectName}
                    </p>
                    <p className="flex items-center gap-2">
                      <span>👤</span> {task.assignedTo}
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📅</span> {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(task)} 
                    className="px-3 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors duration-200 flex items-center gap-1"
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button 
                    onClick={() => handleCompleteTask(task.id, task.projectId)}
                    className={`px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1 ${
                      task.completed 
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }`}
                  >
                    <span>{task.completed ? '❌' : '✅'}</span>
                    {task.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id, task.projectId)}
                    className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-200 flex items-center gap-1"
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a2a3a] p-6 rounded-xl shadow-2xl w-96 border border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-white">Edit Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-300">Task Name</label>
                <input
                  type="text"
                  value={editedTask.name}
                  onChange={(e) => handleChange(e, "name")}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-[#152029] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-300">Assigned To</label>
                <input
                  type="text"
                  value={editedTask.assignedTo}
                  onChange={(e) => handleChange(e, "assignedTo")}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-[#152029] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-300">Deadline</label>
                <input
                  type="date"
                  value={editedTask.deadline}
                  onChange={(e) => handleChange(e, "deadline")}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-[#152029] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowEditDialog(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasks;
