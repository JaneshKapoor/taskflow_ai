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
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

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
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === newProject.id ? newProject : p))
      );
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
  };

  const handleConfirmTasks = (tasks) => {
    if (!selectedProject) return;
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, tasks } : p
    );
    setProjects(updatedProjects);
    setSelectedProject({ ...selectedProject, tasks });
    setTasks(tasks);
  };

  // Calculate progress dynamically
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
    <div className="flex min-h-screen bg-[#152029] text-white">
      <Sidebar
        projects={projects}
        onArchive={(id) => setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, archived: true } : p)))}
        onComplete={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
        onAddProject={() => setShowAddProjectModal(true)}
        onSelectProject={handleSelectProject}
      />
      <div className="flex-1 p-6">
        {selectedProject && (
          <>
            <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
            <p>📌 Project Progress:</p>
            <div className="w-full bg-gray-700 rounded-lg mt-2">
              <div
                className="bg-green-500 text-xs font-bold text-center p-1 rounded-lg"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </>
        )}

        <TaskManager
          tasks={tasks}
          setTasks={setTasks}
          onConfirm={handleConfirmTasks}
          selectedProject={selectedProject}
        />
      </div>

      {showAddProjectModal && (
        <AddProjectModal onClose={() => setShowAddProjectModal(false)} onSubmit={handleAddProject} />
      )}

    </div>
      <div className="mtbtn">
          <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full "
          onClick={() => navigate("/my-tasks")}  
        >
          📋 My Tasks
        </button>
        </div>
        </>
  );
};

export default Dashboard;
