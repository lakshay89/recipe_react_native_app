export class RetryQueue {
  constructor(onRetryTriggered) {
    this.onRetryTriggered = onRetryTriggered;
    this.retryTimeouts = new Map();
  }

  scheduleRetry(task, retryCount) {
    const maxRetries = 3;
    if (retryCount >= maxRetries) {
      return false; // Exceeded limit
    }

    const backoffMs = 1000 * Math.pow(2, retryCount); // 2s, 4s, 8s

    this.cancelRetry(task.taskId);

    const timeoutId = setTimeout(() => {
      this.retryTimeouts.delete(task.taskId);
      this.onRetryTriggered(task, retryCount + 1);
    }, backoffMs);

    this.retryTimeouts.set(task.taskId, timeoutId);
    return true;
  }

  cancelRetry(taskId) {
    if (this.retryTimeouts.has(taskId)) {
      clearTimeout(this.retryTimeouts.get(taskId));
      this.retryTimeouts.delete(taskId);
    }
  }

  clearAll() {
    for (const timeoutId of this.retryTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.retryTimeouts.clear();
  }
}

export default RetryQueue;
