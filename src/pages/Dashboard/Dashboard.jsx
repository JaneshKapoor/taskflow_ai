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
  // Add state for team members modal
  const [showTeamMembersModal, setShowTeamMembersModal] = useState(false);

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
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex space-x-4">
              {/* Add Team Members button */}
              {selectedProject && (
                <button
                  onClick={() => setShowTeamMembersModal(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                >
                  Team Members
                </button>
              )}
              <button
                onClick={() => navigate("/my-tasks")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                My Tasks
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>

          {selectedProject ? (
            <div className="space-y-6">
              <div className="bg-[#1a2a3a] rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">{selectedProject.name}</h2>
                <p className="text-gray-300 mb-4">{selectedProject.description}</p>

                
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {completedTasks}/{totalTasks} tasks completed ({progress}%)
                </p>
              </div>

              <TaskManager
                tasks={tasks}
                setTasks={setTasks}
                onConfirm={handleConfirmTasks}
                selectedProject={selectedProject}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-[#1a2a3a] rounded-xl p-6">
              <p className="text-xl text-gray-400 mb-4">No project selected</p>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Create New Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {showAddProjectModal && (
      <AddProjectModal
        onClose={() => setShowAddProjectModal(false)}
        onSubmit={handleAddProject}
      />
    )}

    {/* Team Members Modal */}
    {showTeamMembersModal && selectedProject && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#1a2a3a] p-6 rounded-xl shadow-2xl w-[500px] border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Team Members - {selectedProject.name}</h3>
            <button 
              onClick={() => setShowTeamMembersModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedProject.team && selectedProject.team.map((member, index) => (
              <div key={index} className="bg-[#152029] p-4 rounded-lg">
                <h4 className="font-medium text-white text-lg">{member.name}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="inline-block mr-1">📧</span> 
                  {member.email}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="inline-block mr-1">🛠️</span> 
                  {member.skills}
                </p>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setShowTeamMembersModal(false)}
            className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default Dashboard;
