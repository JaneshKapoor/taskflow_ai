export const generateTasks = async (project) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`, // ⚠️ Add your real key here
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an AI that distributes tasks among team members efficiently. 
              Ensure that tasks match team members' skills, balance workload, and set deadlines. 
              Return tasks in JSON format with each task having "name", "assignedTo", and "deadline".`,
            },
            {
              role: "user",
              content: `Project Name: ${project.name}  
              Description: ${project.description}  
              Team Members: ${JSON.stringify(project.team)}
  
              Distribute the work among the team members based on their skills, ensuring fair task distribution.
              The user will review and make necessary changes before finalizing.`,
            },
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`GPT API Error: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
  
      try {
        return JSON.parse(data.choices[0].message.content);
      } catch (jsonError) {
        console.error("❌ Error parsing AI response:", jsonError);
        return [];
      }
    } catch (error) {
      console.error("❌ Failed to generate tasks:", error);
      return [];
    }
  };
  
// export const generateTasks = async (project) => {
//     console.warn("⚠️ Using mock tasks instead of GPT API!");
  
//     // Simulate a delay like API response
//     await new Promise((resolve) => setTimeout(resolve, 1000));
  
//     return [
//       {
//         id: 1,
//         name: "Research project requirements",
//         assignedTo: project.team[0]?.name || "Member 1",
//         deadline: "2025-03-25",
//       },
//       {
//         id: 2,
//         name: "Set up project repository",
//         assignedTo: project.team[1]?.name || "Member 2",
//         deadline: "2025-03-26",
//       },
//       {
//         id: 3,
//         name: "Develop UI components",
//         assignedTo: project.team[2]?.name || "Member 3",
//         deadline: "2025-03-30",
//       },
//     ];
//   };
  