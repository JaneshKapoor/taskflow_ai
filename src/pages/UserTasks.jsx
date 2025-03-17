import React, { useEffect, useState } from "react";
import axios from "axios";

const UserTasks = () => {
    const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState("currentUserId"); // Replace with actual user ID
  const [comments, setComments] = useState({});

  useEffect(() => {
    axios
      .get(`/api/tasks/user/${userId}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else {
          console.error("API did not return an array:", response.data);
          setTasks([]); // Prevents map() error
        }
      })
      .catch((error) => {
        console.error("Error fetching user tasks:", error);
        setTasks([]); // Ensure tasks is always an array
      });
  }, [userId]);
  

  const handleMarkComplete = (taskId) => {
    axios
      .post(`/api/tasks/complete/${taskId}`)
      .then(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: "Completed" } : task
          )
        );
      })
      .catch((error) => console.error("Error marking task complete:", error));
  };

  const handleCommentChange = (taskId, comment) => {
    setComments({ ...comments, [taskId]: comment });
  };

  const handleAddComment = (taskId) => {
    axios
      .post(`/api/tasks/comment/${taskId}`, { comment: comments[taskId] })
      .then(() => {
        alert("Comment added successfully");
        setComments({ ...comments, [taskId]: "" });
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-4">My Assigned Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks assigned.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-sm">Assigned by: {task.assignedBy}</p>
              <p className="text-sm">Deadline: {task.deadline}</p>
              <p className="text-sm">Status: {task.status}</p>

              <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => handleMarkComplete(task._id)}
                disabled={task.status === "Completed"}
              >
                {task.status === "Completed" ? "Completed" : "Mark as Complete"}
              </button>

              <div className="mt-2">
                <textarea
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  rows="2"
                  placeholder="Add a comment..."
                  value={comments[task._id] || ""}
                  onChange={(e) => handleCommentChange(task._id, e.target.value)}
                />
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => handleAddComment(task._id)}
                >
                  Add Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTasks;
