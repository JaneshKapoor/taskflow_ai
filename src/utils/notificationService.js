export const sendTaskNotification = (userEmail, task) => {
    console.log(`📢 Notification sent to ${userEmail}:`);
    console.log(`📌 New Task Assigned: ${task.name}`);
    console.log(`⏳ Deadline: ${task.deadline}`);
  };
  