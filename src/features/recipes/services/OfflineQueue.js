import { offlineService } from '../../../shared/services/offlineService';

export class OfflineQueue {
  constructor(onConnectionRestored) {
    this.unsubscribe = offlineService.subscribe((isConnected) => {
      if (isConnected && onConnectionRestored) {
        onConnectionRestored();
      }
    });
  }

  isOnline() {
    return offlineService.isConnected();
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export default OfflineQueue;
