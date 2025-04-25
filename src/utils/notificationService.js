import emailjs from '@emailjs/browser';

// Initialize EmailJS with your User ID
export const initEmailJS = () => {
  emailjs.init("1qGsINHeSiyIUIq9k"); // Your EmailJS User ID
};

export const sendTaskNotification = async (userEmail, task) => {
  console.log(`📢 Notification sent to ${userEmail}:`);
  console.log(`📌 New Task Assigned: ${task.name}`);
  console.log(`⏳ Deadline: ${task.deadline}`);
  
  try {
    const response = await emailjs.send(
      "service_bgp6ev8", 
      "template_tvtp9e6", 
      {
        to_email: userEmail,
        to_name: task.assignedTo,
        task_name: task.name,
        deadline: task.deadline,
        project_name: task.projectName || "TaskFlow AI Project",
        reply_to: userEmail // Add this to make sure replies go to the recipient
      }
    );
    
    console.log("✅ Task notification email sent successfully:", response);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending task notification email:", error);
    return { success: false, error };
  }
};

export const sendTeamInvitation = async (userEmail, userName, project) => {
  console.log(`📧 Team invitation sent to ${userName} (${userEmail}):`);
  console.log(`🔷 Project: ${project.name}`);
  console.log(`📝 Description: ${project.description}`);
  
  try {
    // For EmailJS to send to other recipients, you need to use the reply_to field
    // and make sure your EmailJS template is configured correctly
    const response = await emailjs.send(
      "service_bgp6ev8", 
      "template_0cnqyrp", // Make sure this matches your template ID from EmailJS
      {
        to_email: userEmail,
        to_name: userName,
        project_name: project.name,
        project_description: project.description,
        team_members: project.team.map(member => member.name).join(", "),
        reply_to: userEmail, // This is important for EmailJS to send to this address
        from_name: "TaskFlow AI"
      }
    );
    
    console.log("✅ Team invitation email sent successfully:", response);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending team invitation email:", error);
    console.error("Error details:", error.text || error.message);
    return { success: false, error };
  }
};
  