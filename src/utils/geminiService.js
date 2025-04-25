// Gemini API service for natural language processing
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI("AIzaSyA93TvDsCwkAiQJGfAUWjZZ29-d2FuMn8w");

// Function to parse natural language into structured task data
// Add date handling utilities at the top
const getISTDate = () => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
};

const parseRelativeDate = (dateText) => {
  const today = new Date(getISTDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const dateStr = dateText.toLowerCase();
  let resultDate;

  if (dateStr.includes('tomorrow')) {
    resultDate = tomorrow;
  } else if (dateStr.includes('next week')) {
    resultDate = nextWeek;
  } else if (dateStr.includes('next month')) {
    resultDate = nextMonth;
  } else {
    return dateText; // Return original if not a relative date
  }

  return resultDate.toISOString().split('T')[0];
};

// Update the parseTaskFromText function
export const parseTaskFromText = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const currentDate = new Date(getISTDate()).toISOString().split('T')[0];

    const prompt = `
      Today's date in IST is: ${currentDate}
      
      Parse the following text into a structured task. Extract:
      1. Task title/name
      2. Due date (convert relative dates to YYYY-MM-DD format based on today's IST date)
         - "tomorrow" means ${parseRelativeDate('tomorrow')}
         - "next week" means ${parseRelativeDate('next week')}
         - "next month" means ${parseRelativeDate('next month')}
      3. Assignee (the team member who should do the task)
      
      Return ONLY a JSON object with these fields: 
      { "name": "task name", "assignedTo": "person name", "deadline": "YYYY-MM-DD" }
      
      Text to parse: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      // Convert any relative dates in the response
      if (parsedData.deadline) {
        parsedData.deadline = parseRelativeDate(parsedData.deadline);
      }
      return parsedData;
    }
    
    throw new Error("Could not parse task from text");
  } catch (error) {
    console.error("Error parsing task from text:", error);
    return null;
  }
};

// Function to handle natural language commands
export const processNaturalLanguageCommand = async (text, currentProject, tasks, setTasks) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Updated prompt to include COMPLETE action
    const prompt = `
      Determine if the following text is asking to:
      1. Create a new task (e.g., "Add a task to...", "Remind John to...", "Create a task...")
      2. Delete a task (e.g., "Delete the task...", "Remove the task...", "Cancel the reminder...")
      3. Complete a task (e.g., "Mark the task... as complete", "Complete the task...", "Finish the task...")
      
      Return ONLY "CREATE", "DELETE", or "COMPLETE" as your answer.
      
      Text to analyze: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const intent = response.text().trim();

    if (intent === "CREATE") {
      const taskData = await parseTaskFromText(text);
      if (taskData) {
        // Find the team member's email
        const assignedMember = currentProject.team.find(
          member => member.name.toLowerCase() === taskData.assignedTo.toLowerCase()
        );
        
        if (!assignedMember) {
          return {
            success: false,
            message: `Could not find team member "${taskData.assignedTo}" in this project.`
          };
        }

        // Create the new task
        const newTask = {
          ...taskData,
          id: Date.now(),
          projectId: currentProject.id,
          assignedEmail: assignedMember.email,
          projectName: currentProject.name,
          completed: false
        };

        // Add the task
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        
        return {
          success: true,
          message: `Created task "${newTask.name}" assigned to ${newTask.assignedTo} due on ${newTask.deadline}`,
          task: newTask
        };
      }
    } else if (intent === "DELETE") {
      // Get task name to delete
      const deletePrompt = `
        Extract the name of the task to delete from this text: "${text}"
        Return ONLY the task name, nothing else.
      `;
      
      const deleteResult = await model.generateContent(deletePrompt);
      const deleteResponse = await deleteResult.response;
      const taskNameToDelete = deleteResponse.text().trim();
      
      // Find tasks that match the name
      const matchingTasks = tasks.filter(
        task => task.name.toLowerCase().includes(taskNameToDelete.toLowerCase())
      );
      
      if (matchingTasks.length === 0) {
        return {
          success: false,
          message: `Could not find any task matching "${taskNameToDelete}"`
        };
      } else if (matchingTasks.length === 1) {
        // Delete the task
        const updatedTasks = tasks.filter(task => task.id !== matchingTasks[0].id);
        setTasks(updatedTasks);
        
        return {
          success: true,
          message: `Deleted task "${matchingTasks[0].name}"`
        };
      } else {
        // Multiple matches, return the first one
        const updatedTasks = tasks.filter(task => task.id !== matchingTasks[0].id);
        setTasks(updatedTasks);
        
        return {
          success: true,
          message: `Deleted task "${matchingTasks[0].name}". Note: Multiple matches were found.`
        };
      }
    } else if (intent === "COMPLETE") {
      // Extract task name to complete
      const completePrompt = `
        Extract the name or description of the task to mark as complete from this text.
        Return ONLY the task description/name, nothing else.
        Text: "${text}"
      `;
      
      const completeResult = await model.generateContent(completePrompt);
      const completeResponse = await completeResult.response;
      const taskToComplete = completeResponse.text().trim();
      
      // Find tasks that match the name
      const matchingTasks = tasks.filter(
        task => task.name.toLowerCase().includes(taskToComplete.toLowerCase())
      );
      
      if (matchingTasks.length === 0) {
        return {
          success: false,
          message: `Could not find any task matching "${taskToComplete}"`
        };
      }

      // Complete the first matching task
      const updatedTasks = tasks.map(task => {
        if (task.id === matchingTasks[0].id) {
          return { ...task, completed: true };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      return {
        success: true,
        message: `Marked task "${matchingTasks[0].name}" as complete${matchingTasks.length > 1 ? ". Note: Multiple matching tasks were found." : ""}`,
        task: matchingTasks[0]
      };
    }
    
    return {
      success: false,
      message: "I couldn't understand that command. Try saying something like:\n- 'Remind John to send the report by next Friday'\n- 'Delete the task about the report'\n- 'Mark the task about the presentation as complete'"
    };
  } catch (error) {
    console.error("Error processing natural language command:", error);
    return {
      success: false,
      message: "Sorry, I encountered an error processing your request."
    };
  }
};