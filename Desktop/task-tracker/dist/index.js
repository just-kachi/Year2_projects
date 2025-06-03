import chalk from 'chalk';
import inquirer from 'inquirer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Task from './Task.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data.json');
let tasks = [];
const loadTasks = async () => {
    try {
        await fs.access(DATA_FILE);
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const taskData = JSON.parse(data);
        tasks = taskData.map(obj => Task.fromObject(obj));
        console.log(chalk.green('Tasks loaded successfully!'));
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            tasks = [];
        }
        else {
            console.error(chalk.red('Error loading tasks:'), error);
        }
    }
};
const saveTasks = async () => {
    try {
        const dir = path.dirname(DATA_FILE);
        await fs.mkdir(dir, { recursive: true }).catch(() => { });
        await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
        console.log(chalk.green('Tasks saved successfully!'));
    }
    catch (error) {
        console.error(chalk.red('Error saving tasks:'), error);
    }
};
const getCategoryColor = (category) => {
    const colors = {
        work: chalk.blue,
        personal: chalk.magenta,
        shopping: chalk.green,
        general: chalk.yellow,
        other: chalk.white,
    };
    return colors[category] || chalk.white;
};
const viewTasks = () => {
    console.log(chalk.blue('\n=== Your Tasks ==='));
    if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks found.'));
        return;
    }
    tasks.forEach((task, index) => {
        const status = task.completed ? chalk.green('✓') : chalk.yellow('○');
        const title = task.completed ? chalk.dim(task.title) : chalk.white(task.title);
        const categoryText = getCategoryColor(task.category)(`[${task.category}]`);
        const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(task.createdAt);
        console.log(`${index + 1}. ${status} ${title} ${categoryText} ${chalk.dim(`(created: ${date})`)}`);
        if (task.description) {
            console.log(`   ${chalk.dim(task.description)}`);
        }
    });
    console.log('');
};
const addTask = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter task title:',
            validate: (input) => input.trim() ? true : 'Title is required'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Enter task description (optional):'
        },
        {
            type: 'list',
            name: 'category',
            message: 'Select category:',
            choices: ['work', 'personal', 'general', 'shopping', 'other'],
            default: 'general'
        }
    ]);
    const task = new Task(answers.title.trim(), answers.description.trim(), answers.category);
    tasks = [...tasks, task];
    await saveTasks();
    console.log(chalk.green(`Task "${answers.title}" added successfully!`));
};
const completeTask = async () => {
    if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks to complete!'));
        return;
    }
    viewTasks();
    const { taskIndex } = await inquirer.prompt([
        {
            type: 'number',
            name: 'taskIndex',
            message: 'Enter task number to toggle completion:',
            validate: input => {
                const index = Number(input) - 1;
                return index >= 0 && index < tasks.length ? true : 'Please enter a valid task number';
            },
        },
    ]);
    const index = taskIndex - 1;
    tasks[index].toggleComplete();
    await saveTasks();
    const status = tasks[index].completed ? 'completed' : 'incomplete';
    console.log(chalk.green(`Task marked as ${status}!`));
};
const deleteTask = async () => {
    if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks to delete!'));
        return;
    }
    viewTasks();
    const { taskIndex } = await inquirer.prompt([
        {
            type: 'number',
            name: 'taskIndex',
            message: 'Enter task number to delete:',
            validate: input => {
                const index = Number(input) - 1;
                return index >= 0 && index < tasks.length ? true : 'Please enter a valid task number';
            },
        },
    ]);
    const index = taskIndex - 1;
    const taskTitle = tasks[index].title;
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete task "${taskTitle}"?`,
            default: false,
        },
    ]);
    if (!confirm) {
        console.log(chalk.yellow('Deletion cancelled.'));
        return;
    }
    tasks = tasks.filter((_, i) => i !== index);
    await saveTasks();
    console.log(chalk.green(`Task "${taskTitle}" deleted successfully!`));
};
const searchTasks = async () => {
    const { searchTerm } = await inquirer.prompt([
        {
            type: 'input',
            name: 'searchTerm',
            message: 'Enter search term:',
            validate: input => input.trim() ? true : 'Search term is required'
        }
    ]);
    const term = searchTerm.toLowerCase().trim();
    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term)));
    console.log(chalk.blue(`\n=== Search Results for "${searchTerm}" ===`));
    if (filteredTasks.length === 0) {
        console.log(chalk.yellow('No matching tasks found.'));
        return;
    }
    filteredTasks.forEach((task, index) => {
        const status = task.completed ? chalk.green('✓') : chalk.yellow('○');
        const title = task.completed ? chalk.dim(task.title) : chalk.white(task.title);
        const categoryText = getCategoryColor(task.category)(`[${task.category}]`);
        const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(task.createdAt);
        console.log(`${index + 1}. ${status} ${title} ${categoryText} ${chalk.dim(`(created: ${date})`)}`);
        if (task.description) {
            console.log(`   ${chalk.dim(task.description)}`);
        }
    });
    console.log('');
};
const showStatistics = () => {
    console.log(chalk.blue('\n=== Task Statistics ==='));
    if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks found.'));
        return;
    }
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const categoryCounts = {};
    tasks.forEach(task => {
        categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });
    console.log(`${chalk.yellow('Total Tasks:')} ${chalk.green(totalTasks)}`);
    console.log(`${chalk.yellow('Completed:')} ${chalk.green(completedTasks)} (${(completedTasks / totalTasks * 100).toFixed(0)}%)`);
    console.log(`${chalk.yellow('Pending:')} ${chalk.green(pendingTasks)} (${(pendingTasks / totalTasks * 100).toFixed(0)}%)`);
    console.log(chalk.yellow('\nTasks by Category:'));
    Object.entries(categoryCounts).forEach(([category, count]) => {
        const categoryColor = getCategoryColor(category);
        console.log(`${categoryColor(category)}: ${chalk.green(count)} (${(count / totalTasks * 100).toFixed(0)}%)`);
    });
    console.log('');
};
const showMainMenu = async () => {
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { name: 'View Tasks', value: 'view' },
                    { name: 'Add Task', value: 'add' },
                    { name: 'Complete Task', value: 'complete' },
                    { name: 'Delete Task', value: 'delete' },
                    { name: 'Search Tasks', value: 'search' },
                    { name: 'Show Statistics', value: 'stats' },
                    { name: 'Exit', value: 'exit' },
                ],
            },
        ]);
        if (action === 'exit') {
            console.log(chalk.blue('Goodbye!'));
            break;
        }
        const actions = {
            view: viewTasks,
            add: addTask,
            complete: completeTask,
            delete: deleteTask,
            search: searchTasks,
            stats: showStatistics,
        };
        await actions[action]();
    }
};
const main = async () => {
    console.log(chalk.blue('=========================== Task Tracker ==========================='));
    await loadTasks();
    await showMainMenu();
};
main().catch(error => {
    console.error(chalk.red('An error occurred:'), error);
});
