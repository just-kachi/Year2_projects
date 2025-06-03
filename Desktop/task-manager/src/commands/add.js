import inquirer from 'inquirer';
import chalk from 'chalk';

import Task from '../models/Task.js';
import { loadTasks, saveTasks } from '../utils/storage.js';

// Export default async function to add a new task
export default async function addTask() {
  // Prompt the user for task details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter task title:',
      validate: input => input.trim() !== '' ? true : 'Title is required',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter task description (optional):',
    },
    {
      type: 'confirm',
      name: 'hasDueDate',
      message: 'Does this task have a due date?',
      default: false,
    },
    {
      type: 'input',
      name: 'dueDate',
      message: 'Enter due date (YYYY-MM-DD):',
      when: answers => answers.hasDueDate,
      validate: input => {
        const date = new Date(input);
        return !isNaN(date) ? true : 'Please enter a valid date';
      },
    },
  ]);

  try {
    // Load existing tasks
    const tasks = await loadTasks();

    // Destructure user input
    const { title, description, dueDate } = answers;

    // Create a new task
    const newTask = new Task(title, description, dueDate || null);

    // Add the new task to the task list
    const updatedTasks = [...tasks, newTask.toObject()];

    // Save updated tasks
    await saveTasks(updatedTasks);

    console.log(chalk.green('✓ Task added successfully!'));
  } catch (error) {
    console.error(chalk.red('Error adding task:'), error);
  }
}
