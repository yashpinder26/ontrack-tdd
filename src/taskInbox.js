const taskStore = {};
const messageStore = {};

function getTaskInbox(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid studentId: must be a non-empty string');
  }
  return taskStore[studentId] || [];
}

function getTaskStatus(studentId, taskId) {
  if (!studentId || !taskId) {
    throw new Error('Invalid arguments: studentId and taskId are required');
  }
  const tasks = taskStore[studentId] || [];
  const task = tasks.find(t => t.taskId === taskId);
  return task ? task.status : null;
}

function addTask(studentId, task) {
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Invalid studentId: must be a non-empty string');
  }
  if (!task || !task.taskId || !task.title || !task.unitCode) {
    throw new Error('Invalid task: must include taskId, title, and unitCode');
  }
  const existing = taskStore[studentId] || [];
  if (existing.find(t => t.taskId === task.taskId)) {
    throw new Error(`Task with ID ${task.taskId} already exists for this student`);
  }
  const newTask = {
    taskId: task.taskId,
    title: task.title,
    unitCode: task.unitCode,
    status: 'Submitted',
    submittedAt: task.submittedAt || new Date().toISOString(),
  };
  taskStore[studentId] = [...existing, newTask];
  return newTask;
}

function filterTasksByStatus(studentId, status) {
  const validStatuses = ['Submitted', 'In Review', 'Feedback Available', 'Complete', 'Resubmit'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  const tasks = getTaskInbox(studentId);
  return tasks.filter(t => t.status === status);
}

function getTaskMessages(taskId) {
  if (!taskId || typeof taskId !== 'string') {
    throw new Error('Invalid taskId: must be a non-empty string');
  }
  return messageStore[taskId] || [];
}

function addMessage(taskId, sender, content) {
  if (!taskId || typeof taskId !== 'string') {
    throw new Error('Invalid taskId');
  }
  if (!['student', 'tutor'].includes(sender)) {
    throw new Error('Invalid sender: must be "student" or "tutor"');
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error('Invalid content: message cannot be empty');
  }
  const message = {
    messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    taskId,
    sender,
    content: content.trim(),
    sentAt: new Date().toISOString(),
  };
  messageStore[taskId] = [...(messageStore[taskId] || []), message];
  return message;
}

function _resetStore() {
  Object.keys(taskStore).forEach(k => delete taskStore[k]);
  Object.keys(messageStore).forEach(k => delete messageStore[k]);
}

module.exports = {
  getTaskInbox,
  getTaskStatus,
  addTask,
  filterTasksByStatus,
  getTaskMessages,
  addMessage,
  _resetStore,
};