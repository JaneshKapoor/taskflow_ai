import { useState } from "react";
import { sendTeamInvitation } from "../../utils/notificationService";

const AddProjectModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState([{ name: "", email: "", skills: "" }]);
  const [sendEmails, setSendEmails] = useState(false);
  // Fix: Add the setter function for isSending
  const [isSending, setIsSending] = useState(false);

  const addMember = () => setTeam([...team, { name: "", email: "", skills: "" }]);

  const handleSubmit = async () => {
    if (!name || !description || team.some((m) => !m.name || !m.email || !m.skills)) {
      alert("Please fill all fields.");
      return;
    }

    // Create the project object
    const project = { name, description, team };
    
    // Send email notifications if checkbox is checked
    if (sendEmails && team.length > 0) {
      setIsSending(true);
      console.log("📧 Starting to send emails to team members...");
      
      try {
        const emailPromises = team.map(member => 
          sendTeamInvitation(member.email, member.name, project)
        );
        
        const results = await Promise.all(emailPromises);
        
        if (results.some(result => !result.success)) {
          console.warn("⚠️ Some emails failed to send");
          alert("Some team invitation emails failed to send.");
        } else {
          console.log("✅ All team invitation emails sent successfully");
          alert("All team invitation emails sent successfully!");
        }
      } catch (error) {
        console.error("❌ Error sending team invitation emails:", error);
        alert("Error sending team invitation emails: " + error.message);
      } finally {
        setIsSending(false);
      }
    }
    
    onSubmit(project);
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
        
        {/* Email notification checkbox */}
        {team.some(m => m.email) && (
          <div className="flex items-center my-4">
            <input
              type="checkbox"
              id="sendEmails"
              checked={sendEmails}
              onChange={(e) => setSendEmails(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="sendEmails" className="text-white">
              Send email to Team Members
            </label>
          </div>
        )}
        
        <button 
          className={`bg-green-500 p-2 my-2 w-full rounded ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`} 
          onClick={handleSubmit}
          disabled={isSending}
        >
          {isSending ? '📧 Sending Emails...' : '✅ Submit'}
        </button>
        <button 
          className="bg-red-500 p-2 my-2 w-full rounded" 
          onClick={onClose}
          disabled={isSending}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProjectModal;
