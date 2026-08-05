import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@edible_india_upload_queue';

export class UploadQueue {
  constructor() {
    this.tasks = [];
  }

  async load() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      this.tasks = stored ? JSON.parse(stored) : [];
      return this.tasks;
    } catch (err) {
      console.error('Failed to load upload queue from storage', err);
      this.tasks = [];
      return [];
    }
  }

  async persist() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (err) {
      console.error('Failed to persist upload queue in storage', err);
    }
  }

  async enqueue(task) {
    // Prevent duplicate entries for the same uri/file
    const exists = this.tasks.some(t => t.uri === task.uri && t.status !== 'completed');
    if (exists) return;

    this.tasks.push({
      taskId: task.taskId || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      assetType: task.assetType,
      fileName: task.fileName,
      fileType: task.fileType,
      fileSize: task.fileSize,
      uri: task.uri,
      draftId: task.draftId || null,
      status: 'pending',
      progress: 0,
      retryCount: 0,
      error: null,
      assetId: null
    });
    await this.persist();
  }

  async remove(taskId) {
    this.tasks = this.tasks.filter(t => t.taskId !== taskId);
    await this.persist();
  }

  async update(taskId, updates) {
    const task = this.tasks.find(t => t.taskId === taskId);
    if (task) {
      Object.assign(task, updates);
      await this.persist();
    }
  }

  getPending() {
    return this.tasks.filter(t => t.status === 'pending');
  }

  getAll() {
    return this.tasks;
  }

  clearCompleted() {
    this.tasks = this.tasks.filter(t => t.status !== 'completed');
    this.persist();
  }
}

export default UploadQueue;
