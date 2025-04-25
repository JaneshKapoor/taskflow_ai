import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Remove onConfirm from props
const TaskManager = ({ tasks, setTasks, selectedProject }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    assignedTo: "",
    deadline: "",
    completed: false
  });

  useEffect(() => {
    setIsConfirmed(false);
  }, [selectedProject]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    updatedTasks.splice(result.destination.index, 0, movedTask);

    setTasks(updatedTasks);
  };

  const handleEdit = (task) => {
    setEditTaskId(task.id);
    setEditedTask(task);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    setTasks(tasks.map(task => (task.id === editTaskId ? editedTask : task)));
    setShowEditDialog(false);
    setEditTaskId(null);
  };

  const handleChange = (e, field) => {
    setEditedTask({ ...editedTask, [field]: e.target.value });
  };

  const handleNewTaskChange = (e, field) => {
    setNewTask({ ...newTask, [field]: e.target.value });
  };

  const handleAddTask = () => {
    if (!newTask.name || !newTask.assignedTo || !newTask.deadline) {
      alert("Please fill in all fields");
      return;
    }

    // Find the team member's email based on the selected name
    const assignedMember = selectedProject.team.find(member => member.name === newTask.assignedTo);
    const assignedEmail = assignedMember ? assignedMember.email : '';

    const task = {
      ...newTask,
      id: Date.now(),
      projectId: selectedProject.id,
      assignedEmail: assignedEmail
    };

    // Update both local state and parent component's state
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    
    // Update the project in localStorage
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = savedProjects.map(p => {
      if (p.id === selectedProject.id) {
        return { ...p, tasks: updatedTasks };
      }
      return p;
    });
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    setShowAddTaskDialog(false);
    setNewTask({
      name: "",
      assignedTo: "",
      deadline: "",
      completed: false
    });
  };

  const handleCompleteTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // const handleConfirmTasks = async () => {
  //   try {
  //     setIsConfirmed(true);
  
  //     // Call the onConfirm function passed from parent component
  //     if (onConfirm && typeof onConfirm === 'function') {
  //       onConfirm(tasks);
  //     }
  
  //     // Send tasks to backend for email notifications & database update
  //     try {
  //       const response = await fetch("/api/confirm-tasks", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ tasks }),
  //       });
  
  //       const data = await response.json();
  //       if (data.success) {
  //         alert("Tasks confirmed! Emails sent & tasks assigned.");
  //       } else {
  //         alert("Failed to confirm tasks.");
  //       }
  //     } catch (error) {
  //       console.error("Error confirming tasks:", error);
  //       // Still mark as confirmed even if API fails
  //       alert("Tasks confirmed locally. Email notifications may have failed.");
  //     }
  //   } catch (error) {
  //     console.error("Error in task confirmation process:", error);
  //   }
  // };

  return (
    <div className="bg-[#1a2a3a] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Task Management</h2>
        <button 
          onClick={() => setShowAddTaskDialog(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <span>➕</span> Add New Task
        </button>
      </div>

      {!isConfirmed ? (
        <div className="space-y-8">
          {/* Pending Tasks Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Pending Tasks</h3>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pending-tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {pendingTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps}
                            className="p-4 rounded-lg shadow-md bg-[#152029] border border-gray-700 hover:border-blue-500/30 transition-all duration-200"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <p className="text-lg font-semibold text-white">
                                  {task.name}
                                </p>
                                <div className="space-y-1 text-sm text-gray-300">
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
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="px-3 py-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors duration-200 flex items-center gap-1"
                                >
                                  <span>✅</span> Complete
                                </button>
                                <button 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-200 flex items-center gap-1"
                                >
                                  <span>🗑️</span> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Completed Tasks Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Completed Tasks</h3>
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-4 rounded-lg shadow-md bg-green-900/50 border border-green-500/30 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-300 line-through">
                        {task.name}
                      </p>
                      <div className="space-y-1 text-sm text-gray-400">
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
                        onClick={() => handleCompleteTask(task.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-200 flex items-center gap-1"
                      >
                        <span>❌</span> Undo
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-200 flex items-center gap-1"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-green-400 font-bold text-lg">✨ Tasks Confirmed Successfully!</p>
          <p className="text-gray-400 mt-2">Select a project from the sidebar to view tasks.</p>
        </div>
      )}

      {/* {!isConfirmed && (
        <button 
          className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg w-full hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
          onClick={handleConfirmTasks}
        >
          <span>✅</span> Confirm Task Assignments
        </button>
      )} */}

      {/* Add Task Dialog */}
      {showAddTaskDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a2a3a] p-6 rounded-xl shadow-2xl w-96 border border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-white">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-300">Task Name</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => handleNewTaskChange(e, "name")}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-[#152029] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Enter task name"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-300">Assigned To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => handleNewTaskChange(e, "assignedTo")}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-[#152029] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Team Member</option>
                  {selectedProject.team && selectedProject.team.map((member, index) => (
                    <option key={index} value={member.name}>
                      {member.name} ({member.skills})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-300">Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => handleNewTaskChange(e, "deadline")}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-[#152029] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowAddTaskDialog(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Dialog - Also update this to use a dropdown */}
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
                <select
                  value={editedTask.assignedTo}
                  onChange={(e) => handleChange(e, "assignedTo")}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-[#152029] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Team Member</option>
                  {selectedProject.team && selectedProject.team.map((member, index) => (
                    <option key={index} value={member.name}>
                      {member.name} ({member.skills})
                    </option>
                  ))}
                </select>
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

export default TaskManager;
