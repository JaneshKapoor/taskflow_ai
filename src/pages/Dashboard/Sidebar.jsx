import { useState } from "react";

const Sidebar = ({ projects, onArchive, onComplete, onAddProject, onSelectProject, onDeleteProject }) => {
  const [filter, setFilter] = useState("active");

  const filteredProjects = projects.filter((p) => {
    if (filter === "archived") return p.archived;
    if (filter === "completed") {
      // Only show as completed if there are tasks and all are completed
      return p.tasks.length > 0 && p.tasks.every((t) => t.completed);
    }
    // Show as active if not archived and either has no tasks or has incomplete tasks
    return !p.archived && (p.tasks.length === 0 || p.tasks.some((t) => !t.completed));
  });

  const handleDeleteProject = (projectId, e) => {
    // Stop event propagation to prevent project selection when clicking delete
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      onDeleteProject(projectId);
    }
  };

  const handleArchiveProject = (projectId, e) => {
    // Stop event propagation to prevent project selection when clicking archive
    e.stopPropagation();
    
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const action = project.archived ? 'unarchive' : 'archive';
      if (window.confirm(`Are you sure you want to ${action} this project?`)) {
        onArchive(projectId);
      }
    }
  };

  return (
    <div className="w-64 bg-[#1a2a3a] p-6 min-h-screen border-r border-gray-700">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Projects</h2>
          <div className="space-y-2">
            {filteredProjects.map((project) => {
              const completedTasks = project.tasks.filter(t => t.completed).length;
              const totalTasks = project.tasks.length;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              
              return (
                <div
                  key={project.id}
                  className="relative group"
                >
                  <button
                    onClick={() => onSelectProject(project)}
                    className={`w-full p-4 bg-[#152029] rounded-lg text-left hover:bg-[#1e2d3d] transition-colors duration-200 border ${
                      project.archived 
                        ? 'border-yellow-500/30 hover:border-yellow-500/50' 
                        : 'border-gray-700 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      {project.archived && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded-full">
                          Archived
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400">
                        {completedTasks}/{totalTasks} tasks completed
                      </p>
                    </div>
                  </button>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => handleArchiveProject(project.id, e)}
                      className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                      title={project.archived ? "Unarchive Project" : "Archive Project"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a1 1 0 00-1 1v1h14V5a1 1 0 00-1-1H5zM4 7h16v7a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm2 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Delete Project"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <button 
            className={`w-full p-3 rounded-lg text-left transition-colors duration-200 ${
              filter === "active" 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setFilter("active")}
          >
            📂 Active Projects
          </button>
          <button 
            className={`w-full p-3 rounded-lg text-left transition-colors duration-200 ${
              filter === "archived" 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setFilter("archived")}
          >
            🗄 Archived Projects
          </button>
          <button 
            className={`w-full p-3 rounded-lg text-left transition-colors duration-200 ${
              filter === "completed" 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setFilter("completed")}
          >
            ✅ Completed Projects
          </button>
        </div>

        <button 
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
          onClick={onAddProject}
        >
          <span>➕</span> Add New Project
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
