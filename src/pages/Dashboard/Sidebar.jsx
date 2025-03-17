import { useState } from "react";
import ProjectCard from "../../components/ProjectCard";

const Sidebar = ({ projects, onArchive, onComplete, onAddProject, onSelectProject }) => {
    const [filter, setFilter] = useState("active"); // "active" | "archived" | "completed"
  
    const filteredProjects = projects.filter((p) => {
      if (filter === "archived") return p.archived;
      if (filter === "completed") return p.tasks.every((t) => t.completed); // ✅ Fix
      return !p.archived && p.tasks.some((t) => !t.completed);
    });
  
    return (
      <div className="sidebar_div">
        <h2 className="text-xl font-bold mb-4">Projects</h2>
  
        {filteredProjects.map((project) => (
          <button key={project.id} onClick={() => onSelectProject(project)}
                  className="p-2 bg-[#487a95] text-white rounded w-full mb-2 text-left">
            {project.name}
          </button>
        ))}
  
        <button className="bg-yellow-500 p-2 w-full mt-4" onClick={() => setFilter("active")}>
          📂 Show Active Projects
        </button>
        <button className="bg-gray-500 p-2 w-full mt-2" onClick={() => setFilter("archived")}>
          🗄 Show Archived Projects
        </button>
        <button className="bg-green-600 p-2 w-full mt-2" onClick={() => setFilter("completed")}>
          ✅ Show Completed Projects
        </button>
  
        <button className="bg-blue-500 p-2 w-full mt-4" onClick={onAddProject}>
          ➕ Add Project
        </button>
      </div>
    );
  };
  

export default Sidebar;
