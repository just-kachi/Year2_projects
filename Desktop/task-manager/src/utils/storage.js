// ES6 module with promises and async/await for file operations
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the data file
const DATA_FILE = path.join(__dirname, '../../data.json');

/**
 * Load tasks from the JSON data file.
 * @returns {Promise<Array>} Parsed array of tasks or an empty array if file doesn't exist.
 */
export async function loadTasks() {
  try {
    // Check if file exists
    await fs.access(DATA_FILE);

    // Read and parse data
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty array if file doesn't exist
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Save tasks to the JSON data file.
 * @param {Array} tasks - Array of task objects to save.
 * @returns {Promise<boolean>} Returns true after successful save.
 */
export async function saveTasks(tasks) {
  const dir = path.dirname(DATA_FILE);

  // Create directory if it doesn't exist
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  // Write tasks to file with pretty formatting
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  return true;
}