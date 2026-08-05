import { recipeApiService } from './recipeApiService';
import UploadQueue from './UploadQueue';
import OfflineQueue from './OfflineQueue';
import RetryQueue from './RetryQueue';

export class UploadService {
  constructor() {
    this.queue = new UploadQueue();
    this.activeRequests = new Map();
    this.isPaused = false;
    this.listeners = new Set();
    this.progressListeners = new Set();

    // Instantiate network status listener
    this.offlineQueue = new OfflineQueue(() => {
      console.log('[UploadService] Connection restored. Resuming queue...');
      this.processNext();
    });

    // Instantiate retry schedule queue
    this.retryQueue = new RetryQueue((task, nextRetryCount) => {
      console.log(`[UploadService] Triggering retry attempt ${nextRetryCount} for task ${task.taskId}`);
      this.queue.update(task.taskId, { status: 'pending', retryCount: nextRetryCount });
      this.notifyQueueChanged();
      this.processNext();
    });
  }

  async init() {
    await this.queue.load();
    // Auto-resume pending uploads on app startup if online
    this.processNext();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.queue.getAll());
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeProgress(listener) {
    this.progressListeners.add(listener);
    return () => {
      this.progressListeners.delete(listener);
    };
  }

  notifyQueueChanged() {
    const all = this.queue.getAll();
    this.listeners.forEach(l => l(all));
  }

  notifyProgress(taskId, progress) {
    this.progressListeners.forEach(l => l({ taskId, progress }));
  }

  async enqueue(uri, fileName, fileType, fileSize, assetType, draftId = null) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await this.queue.enqueue({
      taskId,
      uri,
      fileName,
      fileType: fileType || 'image/jpeg',
      fileSize: fileSize || 500 * 1024,
      assetType,
      draftId
    });
    this.notifyQueueChanged();
    this.processNext();
    return taskId;
  }

  async processNext() {
    if (this.isPaused || !this.offlineQueue.isOnline()) {
      return;
    }

    const pending = this.queue.getPending();
    if (pending.length === 0) {
      return;
    }

    // Process first pending task (FIFO serial queue)
    const task = pending[0];
    await this.executeUpload(task);
  }

  async executeUpload(task) {
    await this.queue.update(task.taskId, { status: 'uploading', error: null });
    this.notifyQueueChanged();

    try {
      // Step 1: Initiate upload on backend
      const initRes = await recipeApiService.initiateUpload(
        task.assetType,
        task.fileName,
        task.fileType,
        task.fileSize,
        task.draftId
      );

      const { asset, uploadInstructions } = initRes.data;
      const assetId = asset.assetId;
      await this.queue.update(task.taskId, { assetId });

      // Step 2: Upload file directly to storage provider (R2 via PUT, local via POST)
      await this.performXhrUpload(
        task.taskId,
        uploadInstructions.uploadUrl,
        uploadInstructions.uploadMethod,
        uploadInstructions.fields,
        task.uri,
        task.fileType,
        task.fileName,
        (progress) => {
          this.queue.update(task.taskId, { progress });
          this.notifyProgress(task.taskId, progress);
        }
      );

      // Step 3: Complete upload on backend
      await recipeApiService.completeUpload(assetId);

      await this.queue.update(task.taskId, { status: 'completed', progress: 100 });
      this.notifyQueueChanged();

      // Trigger next task in the queue
      this.processNext();
    } catch (err) {
      const errMsg = err.message || 'Upload failed';
      console.warn(`[UploadService] Task ${task.taskId} failed:`, errMsg);

      // Distinguish client connectivity failures for scheduling retry
      const isTransient = errMsg.includes('Network') || errMsg.includes('timeout') || errMsg.includes('Abort');

      if (isTransient && this.offlineQueue.isOnline()) {
        const scheduled = this.retryQueue.scheduleRetry(task, task.retryCount);
        if (scheduled) {
          await this.queue.update(task.taskId, { status: 'paused', error: `${errMsg} (Retrying...)` });
        } else {
          await this.queue.update(task.taskId, { status: 'failed', error: `${errMsg} (Exceeded retry limit)` });
        }
      } else {
        await this.queue.update(task.taskId, { status: 'failed', error: errMsg });
      }

      this.notifyQueueChanged();
      // Proceed to other tasks in queue if any
      this.processNext();
    }
  }

  performXhrUpload(taskId, uploadUrl, method, fields, fileUri, fileType, fileName, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      this.activeRequests.set(taskId, xhr);

      xhr.open(method || 'PUT', uploadUrl);
      xhr.timeout = 25000; // 25 seconds timeout limit

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        this.activeRequests.delete(taskId);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          reject(new Error(`Upload failed with status code ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        this.activeRequests.delete(taskId);
        reject(new Error('Network upload error'));
      };

      xhr.ontimeout = () => {
        this.activeRequests.delete(taskId);
        reject(new Error('Upload request timed out'));
      };

      if (method === 'PUT') {
        // Direct binary PUT upload to R2
        xhr.setRequestHeader('Content-Type', fileType);
        xhr.send({
          uri: fileUri,
          type: fileType,
          name: fileName
        });
      } else {
        // Multipart POST upload to local
        const formData = new FormData();
        if (fields) {
          Object.keys(fields).forEach(key => {
            formData.append(key, fields[key]);
          });
        }
        formData.append('file', {
          uri: fileUri,
          type: fileType,
          name: fileName
        });
        xhr.send(formData);
      }
    });
  }

  async pause() {
    this.isPaused = true;
    // Abort all active requests
    for (const [taskId, xhr] of this.activeRequests.entries()) {
      xhr.abort();
      this.activeRequests.delete(taskId);
      await this.queue.update(taskId, { status: 'pending', progress: 0 });
    }
    this.notifyQueueChanged();
  }

  async resume() {
    this.isPaused = false;
    this.processNext();
  }

  async cancel(taskId) {
    this.retryQueue.cancelRetry(taskId);
    if (this.activeRequests.has(taskId)) {
      this.activeRequests.get(taskId).abort();
      this.activeRequests.delete(taskId);
    }
    await this.queue.remove(taskId);
    this.notifyQueueChanged();
    this.processNext();
  }

  async retry(taskId) {
    this.retryQueue.cancelRetry(taskId);
    await this.queue.update(taskId, { status: 'pending', retryCount: 0, error: null });
    this.notifyQueueChanged();
    this.processNext();
  }

  destroy() {
    this.offlineQueue.destroy();
    this.retryQueue.clearAll();
    for (const xhr of this.activeRequests.values()) {
      xhr.abort();
    }
    this.activeRequests.clear();
  }
}

export const uploadService = new UploadService();
export default uploadService;
