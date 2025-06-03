export type Category = 'work' | 'personal' | 'shopping' | 'general' | 'other';

export interface TaskData {
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  category: Category;
}

export default class Task {
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  category: Category;

  constructor(title: string, description = '', category: Category = 'general') {
    this.title = title;
    this.description = description;
    this.completed = false;
    this.createdAt = new Date();
    this.category = category;
  }

  toggleComplete(): void {
    this.completed = !this.completed;
  }

  toJSON(): TaskData {
    return {
      title: this.title,
      description: this.description,
      completed: this.completed,
      createdAt: this.createdAt.toISOString(),
      category: this.category,
    };
  }

  static fromObject(obj: TaskData): Task {
    const task = new Task(obj.title, obj.description, obj.category);
    task.completed = obj.completed;
    task.createdAt = new Date(obj.createdAt);
    return task;
  }
}
