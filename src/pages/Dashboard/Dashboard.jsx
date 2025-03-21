import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Sidebar from "./Sidebar";
import AddProjectModal from "./AddProjectModal";
import TaskManager from "./Taskmanager";
import { generateTasks } from "../../utils/gptService";
import "../../layouts/Dashboard.css"

const Dashboard = () => {
  const [_user, setUser] = useState(null);
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });
  const [selectedProject, setSelectedProject] = useState(() => {
    const savedSelectedProject = localStorage.getItem('selectedProject');
    return savedSelectedProject ? JSON.parse(savedSelectedProject) : null;
  });
  const [tasks, setTasks] = useState(() => {
    if (selectedProject) {
      return selectedProject.tasks || [];
    }
    return [];
  });
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Save selected project to localStorage whenever it changes
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    } else {
      localStorage.removeItem('selectedProject');
    }
  }, [selectedProject]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  const handleAddProject = async (project) => {
    const newProject = { ...project, id: Date.now(), archived: false, tasks: [] };
    setProjects((prevProjects) => [...prevProjects, newProject]);
    setShowAddProjectModal(false);

    try {
      const generatedTasks = await generateTasks(project);
      newProject.tasks = generatedTasks;
      setProjects((prevProjects) => {
        const updatedProjects = prevProjects.map((p) => (p.id === newProject.id ? newProject : p));
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        return updatedProjects;
      });
      if (!selectedProject) {
        setSelectedProject(newProject);
        setTasks(generatedTasks);
      }
    } catch (error) {
      console.error("Failed to generate tasks:", error);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setTasks(project.tasks || []);
    localStorage.setItem('selectedProject', JSON.stringify(project));
  };

  const handleConfirmTasks = (tasks) => {
    if (!selectedProject) return;
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, tasks } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    const updatedSelectedProject = { ...selectedProject, tasks };
    setSelectedProject(updatedSelectedProject);
    localStorage.setItem('selectedProject', JSON.stringify(updatedSelectedProject));
    setTasks(tasks);
  };

  // Update tasks when selected project changes
  useEffect(() => {
    if (selectedProject) {
      setTasks(selectedProject.tasks || []);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  // Calculate progress dynamically
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleDeleteProject = (projectId) => {
    // Remove the project from the projects array
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    
    // If the deleted project was selected, clear the selection
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null);
      setTasks([]);
    }
  };

  return (
    <>
    <div className="flex min-h-screen bg-gradient-to-br from-[#152029] to-[#1a2a3a] text-white">
      <Sidebar
        projects={projects}
        onArchive={(id) => setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, archived: true } : p)))}
        onComplete={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
        onAddProject={() => setShowAddProjectModal(true)}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />
      <div className="flex-1">
        <div className="flex justify-between items-center p-6 bg-[#1a2a3a] shadow-lg">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
              onClick={() => navigate("/my-tasks")}  
            >
              <span>📋</span> My Tasks
            </button>
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
              onClick={handleLogout}  
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
        <div className="p-6">
          {selectedProject ? (
            <>
              <div className="bg-[#1a2a3a] rounded-xl p-6 shadow-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-white">{selectedProject.name}</h1>
                  <span className="text-sm text-gray-300">Created: {new Date(selectedProject.id).toLocaleDateString()}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300 mb-2">📊 Project Progress</p>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full text-xs font-bold text-center p-1 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      >
                        {progress}%
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#152029] p-4 rounded-lg">
                      <p className="text-gray-400">Total Tasks</p>
                      <p className="text-2xl font-bold">{totalTasks}</p>
                    </div>
                    <div className="bg-[#152029] p-4 rounded-lg">
                      <p className="text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-green-500">{completedTasks}</p>
                    </div>
                    <div className="bg-[#152029] p-4 rounded-lg">
                      <p className="text-gray-400">Remaining</p>
                      <p className="text-2xl font-bold text-yellow-500">{totalTasks - completedTasks}</p>
                    </div>
                  </div>
                </div>
              </div>

              <TaskManager
                tasks={tasks}
                setTasks={setTasks}
                onConfirm={handleConfirmTasks}
                selectedProject={selectedProject}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Project Selected</h2>
              <p className="text-gray-400 mb-6">Select a project from the sidebar or create a new one to get started.</p>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                onClick={() => setShowAddProjectModal(true)}
              >
                <span>➕</span> Create New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddProjectModal && (
        <AddProjectModal onClose={() => setShowAddProjectModal(false)} onSubmit={handleAddProject} />
      )}
    </div>
    </>
  );
};

export default Dashboard;
