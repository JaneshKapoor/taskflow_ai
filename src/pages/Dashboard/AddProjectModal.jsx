import { useState } from "react";

const AddProjectModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState([{ name: "", email: "", skills: "" }]);

  const addMember = () => setTeam([...team, { name: "", email: "", skills: "" }]);

  const handleSubmit = () => {
    if (!name || !description || team.some((m) => !m.name || !m.email || !m.skills)) {
      alert("Please fill all fields.");
      return;
    }
    onSubmit({ name, description, team });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-[#152029] p-6 rounded w-96">
        <h2 className="text-white text-xl mb-4">Add Project</h2>

        <input className="p-2 w-full my-2 bg-gray-800 text-white rounded" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="p-2 w-full my-2 bg-gray-800 text-white rounded" placeholder="Project Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <h3 className="text-white">Team Members</h3>
        {team.map((member, index) => (
          <div key={index} className="space-y-2 my-2">
            <input 
              className="p-2 bg-gray-800 text-white rounded w-full" 
              placeholder="Name" 
              value={member.name} 
              onChange={(e) => {
                const updated = [...team];
                updated[index].name = e.target.value;
                setTeam(updated);
              }} 
            />
            <input 
              className="p-2 bg-gray-800 text-white rounded w-full" 
              placeholder="Email" 
              type="email"
              value={member.email} 
              onChange={(e) => {
                const updated = [...team];
                updated[index].email = e.target.value;
                setTeam(updated);
              }} 
            />
            <input 
              className="p-2 bg-gray-800 text-white rounded w-full" 
              placeholder="Skills (comma-separated)" 
              value={member.skills} 
              onChange={(e) => {
                const updated = [...team];
                updated[index].skills = e.target.value;
                setTeam(updated);
              }} 
            />
          </div>
        ))}
        <button className="bg-gray-500 p-2 my-2 w-full rounded" onClick={addMember}>➕ Add Member</button>
        <button className="bg-green-500 p-2 my-2 w-full rounded" onClick={handleSubmit}>✅ Submit</button>
        <button className="bg-red-500 p-2 my-2 w-full rounded" onClick={onClose}>❌ Cancel</button>
      </div>
    </div>
  );
};

export default AddProjectModal;
