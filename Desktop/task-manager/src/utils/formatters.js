import chalk from 'chalk';

// Arrow function to format a single task for display
export const formatTask = (task) => {
  // Use chalk for status and title styling
  const status = task.completed ? chalk.green('✓') : chalk.yellow('○');
  const title = task.completed ? chalk.dim(task.title) : chalk.white(task.title);

  // Format the creation date using the Intl.DateTimeFormat API
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const created = dateFormatter.format(new Date(task.createdAt));

  // Combine all parts into a formatted string
  return `${status} ${title} ${chalk.dim(`[${task.id}] - Created: ${created}`)}`;
};

// Format a list of tasks with numbered index
export const formatTaskList = (tasks) => {
  if (tasks.length === 0) {
    return chalk.dim('No tasks found.');
  }

  // Use map and join to format each task in the list
  return tasks.map((task, index) => {
    return `${chalk.blue(index + 1)}. ${formatTask(task)}`;
  }).join('\n');
};
