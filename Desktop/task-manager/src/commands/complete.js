import chalk from 'chalk';

import { loadTasks } from '../utils/storage.js';
import { formatTaskList } from '../utils/formatters.js';

// Function to list all tasks with status summary
export default async function listTasks() {
  try {
    // Load tasks from storage
    const tasks = await loadTasks();

    // Display header
    console.log(chalk.blue.bold('\nYour Tasks:'));
    console.log('====================');

    // Output formatted task list
    console.log(formatTaskList(tasks));
    console.log('====================');

    // Calculate and display stats
    const completed = tasks.filter(task => task.completed).length;
    const remaining = tasks.length - completed;

    console.log(
      chalk.blue(`Stats: ${tasks.length} total, `) +
      chalk.green(`${completed} completed, `) +
      chalk.yellow(`${remaining} remaining`)
    );
  } catch (error) {
    console.error(chalk.red('Error listing tasks:'), error);
  }
}
