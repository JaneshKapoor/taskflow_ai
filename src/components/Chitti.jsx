import { useState, useRef, useEffect } from "react";
import { processNaturalLanguageCommand } from "../utils/geminiService";
import { sendTaskNotification } from "../utils/notificationService";

const Chitti = ({ selectedProject, tasks, setTasks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hi, I'm Chitti! I can help you manage tasks using natural language. Try saying something like 'Remind Janesh to send the report by next Friday'", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isProcessing) return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    // Check if a project is selected
    if (!selectedProject) {
      setMessages(prev => [
        ...prev, 
        { text: "Please select a project first before adding tasks.", sender: "bot" }
      ]);
      setIsProcessing(false);
      return;
    }
    
    try {
      // Process the natural language command
      const result = await processNaturalLanguageCommand(
        userMessage.text, 
        selectedProject, 
        tasks, 
        setTasks
      );
      
      // Add bot response to chat
      setMessages(prev => [...prev, { text: result.message, sender: "bot" }]);
      
      // If a task was created, send notification
      if (result.success && result.task) {
        try {
          await sendTaskNotification(result.task.assignedEmail, result.task);
        } catch (error) {
          console.error("Failed to send task notification:", error);
        }
        
        // Update localStorage
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const updatedProjects = savedProjects.map(p => {
          if (p.id === selectedProject.id) {
            return { ...p, tasks };
          }
          return p;
        });
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      }
    } catch (error) {
      console.error("Error in Chitti:", error);
      setMessages(prev => [
        ...prev, 
        { text: "Sorry, I encountered an error processing your request.", sender: "bot" }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs mt-1">Chitti</span>
          </div>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-[#1a2a3a] rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Chitti - Task Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 bg-[#152029]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-[#1e2d3d] text-white border border-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-[#1a2a3a]">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-600 rounded-l-lg bg-[#152029] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <button
                type="submit"
                className={`bg-blue-500 text-white p-2 rounded-r-lg ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chitti;