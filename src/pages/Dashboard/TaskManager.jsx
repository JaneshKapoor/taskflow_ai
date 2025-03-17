import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const TaskManager = ({ tasks, setTasks, onConfirm, selectedProject }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});

  useEffect(() => {
    setIsConfirmed(false); // Reset confirmation when a new project is selected
  }, [selectedProject]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, movedTask);

    setTasks(updatedTasks);
  };

  const handleConfirmTasks = async () => {
    try {
      setIsConfirmed(true);
  
      // Send tasks to backend for email notifications & database update
      const response = await fetch("/api/confirm-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert("Tasks confirmed! Emails sent & tasks assigned.");
      } else {
        alert("Failed to confirm tasks.");
      }
    } catch (error) {
      console.error("Error confirming tasks:", error);
    }
  };
  

  const handleEdit = (task) => {
    setEditTaskId(task.id);
    setEditedTask(task);
  };

  const handleSaveEdit = () => {
    setTasks(tasks.map(task => (task.id === editTaskId ? editedTask : task)));
    setEditTaskId(null);
  };

  const handleChange = (e, field) => {
    setEditedTask({ ...editedTask, [field]: e.target.value });
  };

  return (
    <div className="p-4 bg-[#152029] text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{selectedProject?.name} - Task Assignments</h2>

      {!isConfirmed ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.draggableProps} 
                        {...provided.dragHandleProps}
                        className="p-4 bg-[#bad1de] text-[#152029] rounded-lg shadow-md"
                      >
                        {editTaskId === task.id ? (
                          <>
                            <input
                              type="text"
                              value={editedTask.name}
                              onChange={(e) => handleChange(e, "name")}
                              className="w-full p-1 rounded border"
                            />
                            <input
                              type="text"
                              value={editedTask.assignedTo}
                              onChange={(e) => handleChange(e, "assignedTo")}
                              className="w-full p-1 rounded border mt-2"
                            />
                            <input
                              type="date"
                              value={editedTask.deadline}
                              onChange={(e) => handleChange(e, "deadline")}
                              className="w-full p-1 rounded border mt-2"
                            />
                            <button onClick={handleSaveEdit} className="mt-2 px-2 py-1 bg-green-500 text-white rounded">
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <p><strong>{task.name}</strong></p>
                            <p>👤 Assigned to: {task.assignedTo}</p>
                            <p>📅 Deadline: {task.deadline}</p>
                            <button onClick={() => handleEdit(task)} className="mt-2 px-2 py-1 bg-yellow-500 text-white rounded">
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <p className="text-center text-green-300 font-bold">✔ Tasks Confirmed. Select a project from the sidebar to view.</p>
      )}

      {!isConfirmed && (
        <button 
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded w-full"
          onClick={handleConfirmTasks}
        >
          ✅ Confirm Task Assignments
        </button>
      )}
    </div>
  );
};

export default TaskManager;
