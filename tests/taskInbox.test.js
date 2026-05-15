const {
  getTaskInbox, getTaskStatus, addTask,
  filterTasksByStatus, getTaskMessages, addMessage, _resetStore,
} = require('../src/taskInbox');

beforeEach(() => { _resetStore(); });

describe('getTaskInbox()', () => {
  test('returns empty array for student with no tasks', () => {
    expect(getTaskInbox('S001')).toEqual([]);
  });
  test('returns all tasks for a valid student ID', () => {
    addTask('S001', { taskId: 'T1', title: 'Task 1', unitCode: 'SIT333' });
    addTask('S001', { taskId: 'T2', title: 'Task 2', unitCode: 'SIT333' });
    expect(getTaskInbox('S001')).toHaveLength(2);
  });
  test('does not mix tasks between different students', () => {
    addTask('S001', { taskId: 'T1', title: 'Task 1', unitCode: 'SIT333' });
    addTask('S002', { taskId: 'T2', title: 'Task 2', unitCode: 'SIT333' });
    expect(getTaskInbox('S001')).toHaveLength(1);
    expect(getTaskInbox('S002')).toHaveLength(1);
  });
  test('throws for null studentId', () => {
    expect(() => getTaskInbox(null)).toThrow('Invalid studentId');
  });
  test('throws for empty string studentId', () => {
    expect(() => getTaskInbox('')).toThrow('Invalid studentId');
  });
  test('throws for number studentId', () => {
    expect(() => getTaskInbox(123)).toThrow('Invalid studentId');
  });
});

describe('addTask()', () => {
  test('returns task with status Submitted', () => {
    const task = addTask('S001', { taskId: 'T1', title: 'Intro to TDD', unitCode: 'SIT333' });
    expect(task.status).toBe('Submitted');
    expect(task.taskId).toBe('T1');
  });
  test('added task appears in inbox', () => {
    addTask('S001', { taskId: 'T1', title: 'Intro to TDD', unitCode: 'SIT333' });
    expect(getTaskInbox('S001')[0].taskId).toBe('T1');
  });
  test('throws when task missing required fields', () => {
    expect(() => addTask('S001', { taskId: 'T1' })).toThrow('Invalid task');
  });
  test('throws when taskId is missing', () => {
    expect(() => addTask('S001', { title: 'Task', unitCode: 'SIT333' })).toThrow('Invalid task');
  });
  test('throws on duplicate task', () => {
    addTask('S001', { taskId: 'T1', title: 'Task 1', unitCode: 'SIT333' });
    expect(() => addTask('S001', { taskId: 'T1', title: 'Dup', unitCode: 'SIT333' })).toThrow('already exists');
  });
  test('throws for invalid studentId', () => {
    expect(() => addTask('', { taskId: 'T1', title: 'Task', unitCode: 'SIT333' })).toThrow('Invalid studentId');
  });
  test('auto-assigns submittedAt', () => {
    const task = addTask('S001', { taskId: 'T1', title: 'Task', unitCode: 'SIT333' });
    expect(typeof task.submittedAt).toBe('string');
  });
  test('uses provided submittedAt', () => {
    const date = '2024-01-15T10:00:00.000Z';
    const task = addTask('S001', { taskId: 'T1', title: 'Task', unitCode: 'SIT333', submittedAt: date });
    expect(task.submittedAt).toBe(date);
  });
});

describe('getTaskStatus()', () => {
  test('returns Submitted for a new task', () => {
    addTask('S001', { taskId: 'T1', title: 'Task 1', unitCode: 'SIT333' });
    expect(getTaskStatus('S001', 'T1')).toBe('Submitted');
  });
  test('returns null for non-existent task', () => {
    expect(getTaskStatus('S001', 'NONE')).toBeNull();
  });
  test('throws when studentId is missing', () => {
    expect(() => getTaskStatus(null, 'T1')).toThrow('Invalid arguments');
  });
  test('throws when taskId is missing', () => {
    expect(() => getTaskStatus('S001', null)).toThrow('Invalid arguments');
  });
});

describe('filterTasksByStatus()', () => {
  beforeEach(() => {
    addTask('S001', { taskId: 'T1', title: 'Task 1', unitCode: 'SIT333' });
    addTask('S001', { taskId: 'T2', title: 'Task 2', unitCode: 'SIT333' });
    addTask('S001', { taskId: 'T3', title: 'Task 3', unitCode: 'SIT333' });
  });
  test('returns all Submitted tasks', () => {
    expect(filterTasksByStatus('S001', 'Submitted')).toHaveLength(3);
  });
  test('returns empty array when no tasks match', () => {
    expect(filterTasksByStatus('S001', 'Complete')).toHaveLength(0);
  });
  test('throws for invalid status', () => {
    expect(() => filterTasksByStatus('S001', 'Pending')).toThrow('Invalid status');
  });
  test('accepts all valid statuses without throwing', () => {
    ['Submitted', 'In Review', 'Feedback Available', 'Complete', 'Resubmit'].forEach(s => {
      expect(() => filterTasksByStatus('S001', s)).not.toThrow();
    });
  });
});

describe('getTaskMessages()', () => {
  test('returns empty array for task with no messages', () => {
    expect(getTaskMessages('T1')).toEqual([]);
  });
  test('returns messages after they are added', () => {
    addMessage('T1', 'student', 'Please review my submission.');
    expect(getTaskMessages('T1')[0].content).toBe('Please review my submission.');
  });
  test('throws for invalid taskId', () => {
    expect(() => getTaskMessages('')).toThrow('Invalid taskId');
    expect(() => getTaskMessages(null)).toThrow('Invalid taskId');
  });
});

describe('addMessage()', () => {
  test('adds a student message', () => {
    const msg = addMessage('T1', 'student', 'Here is my work.');
    expect(msg.sender).toBe('student');
    expect(msg.content).toBe('Here is my work.');
  });
  test('adds a tutor message', () => {
    const msg = addMessage('T1', 'tutor', 'Fix section 2.');
    expect(msg.sender).toBe('tutor');
  });
  test('stores multiple messages in order', () => {
    addMessage('T1', 'student', 'First');
    addMessage('T1', 'tutor', 'Second');
    const msgs = getTaskMessages('T1');
    expect(msgs[0].content).toBe('First');
    expect(msgs[1].content).toBe('Second');
  });
  test('throws for invalid sender', () => {
    expect(() => addMessage('T1', 'admin', 'Hello')).toThrow('Invalid sender');
  });
  test('throws for empty content', () => {
    expect(() => addMessage('T1', 'student', '')).toThrow('Invalid content');
    expect(() => addMessage('T1', 'student', '   ')).toThrow('Invalid content');
  });
  test('throws for invalid taskId', () => {
    expect(() => addMessage('', 'student', 'Hello')).toThrow('Invalid taskId');
  });
  test('trims whitespace from content', () => {
    const msg = addMessage('T1', 'student', '  hello  ');
    expect(msg.content).toBe('hello');
  });
  test('keeps messages for different tasks separate', () => {
    addMessage('T1', 'student', 'Task 1 msg');
    addMessage('T2', 'student', 'Task 2 msg');
    expect(getTaskMessages('T1')).toHaveLength(1);
    expect(getTaskMessages('T2')).toHaveLength(1);
  });
});