const ProjectCard = ({ project, onComplete, onArchive }) => {
    return (
      <div className="p-4 bg-[#000000] text-white rounded-lg shadow-md mb-2">
        <h3 className="text-lg font-bold">{project.name}</h3>
        <p className="text-sm text-gray-300">{project.description}</p>
  
        <div className="mt-2">
          {!project.archived && (
            <>
              <button
                className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded mr-2"
                onClick={() => onComplete(project.id)}
              >
                ✅ Complete
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
                onClick={() => onArchive(project.id)}
              >
                🗂 Archive
              </button>
            </>
          )}
        </div>
      </div>
    );
  };
  
  export default ProjectCard;
  