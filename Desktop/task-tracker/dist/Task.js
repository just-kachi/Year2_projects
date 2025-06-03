export default class Task {
    title;
    description;
    completed;
    createdAt;
    category;
    constructor(title, description = '', category = 'general') {
        this.title = title;
        this.description = description;
        this.completed = false;
        this.createdAt = new Date();
        this.category = category;
    }
    toggleComplete() {
        this.completed = !this.completed;
    }
    toJSON() {
        return {
            title: this.title,
            description: this.description,
            completed: this.completed,
            createdAt: this.createdAt.toISOString(),
            category: this.category,
        };
    }
    static fromObject(obj) {
        const task = new Task(obj.title, obj.description, obj.category);
        task.completed = obj.completed;
        task.createdAt = new Date(obj.createdAt);
        return task;
    }
}
