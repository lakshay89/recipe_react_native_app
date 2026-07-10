import { useState, useEffect } from 'react';

let isConnectedGlobal = true;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener(isConnectedGlobal));
};

// Periodic connectivity checks
const runConnectivityCheck = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // HEAD request to lightweight endpoint to check real network link
    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const nextState = response.status === 204 || response.status === 200 || response.ok || response.status === 0;
    if (nextState !== isConnectedGlobal) {
      isConnectedGlobal = nextState;
      notifyListeners();
    }
  } catch {
    if (isConnectedGlobal) {
      isConnectedGlobal = false;
      notifyListeners();
    }
  }
};

// Run check periodically
setInterval(runConnectivityCheck, 10000);
runConnectivityCheck(); // Run immediate check on load

export const offlineService = {
  isConnected() {
    return isConnectedGlobal;
  },

  subscribe(listener) {
    listeners.add(listener);
    listener(isConnectedGlobal);
    return () => {
      listeners.delete(listener);
    };
  },

  simulateOffline(offline) {
    isConnectedGlobal = !offline;
    notifyListeners();
  }
};

export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(isConnectedGlobal);

  useEffect(() => {
    return offlineService.subscribe((status) => {
      setIsConnected(status);
    });
  }, []);

  return isConnected;
};

export default offlineService;
