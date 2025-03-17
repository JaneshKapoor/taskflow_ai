import { Draggable } from "@hello-pangea/dnd";

const TaskCard = ({ task, index, onComplete }) => {
  return (
    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 rounded-lg shadow-md mb-2 ${
            task.completed ? "bg-green-500 text-white" : "bg-[#bad1de] text-[#152029]"
          }`}
        >
          <h3 className="text-lg font-bold">{task.name}</h3>
          <p className="text-sm">👤 {task.assignedTo}</p>
          <p className="text-sm">📅 Deadline: {task.deadline}</p>
          {!task.completed && (
            <button className="mt-2 px-3 py-1 bg-green-700 text-white rounded" onClick={() => onComplete(task.id)}>
              ✅ Mark Complete
            </button>
          )}
          {task.completed && <p className="mt-2 text-sm font-bold">✔ Completed</p>}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
