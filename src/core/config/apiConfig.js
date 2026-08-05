import { Platform } from 'react-native';

// Toggle configuration options for development / production
const ENV = 'development'; // 'development' | 'production'
const DEV_MODE = 'usb'; // 'emulator' | 'usb' | 'wifi'
const CONFIGURABLE_LAN_IP = '192.168.1.5'; // Toggle changing LAN IP here for Wi-Fi physical device testing
const APPROVED_API_DOMAIN = 'api.edibleindia.org'; // Approved production API domain

let baseUrl = '';

if (ENV === 'production') {
  baseUrl = `https://${APPROVED_API_DOMAIN}`;
} else {
  // Development Mode
  if (DEV_MODE === 'emulator') {
    baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000';
  } else if (DEV_MODE === 'usb') {
    baseUrl = 'http://127.0.0.1:3000';
  } else if (DEV_MODE === 'wifi') {
    if (!CONFIGURABLE_LAN_IP) {
      throw new Error('[apiConfig] CONFIGURABLE_LAN_IP is missing or invalid for wifi DEV_MODE.');
    }
    baseUrl = `http://${CONFIGURABLE_LAN_IP}:3000`;
  } else {
    throw new Error(`[apiConfig] Invalid DEV_MODE: ${DEV_MODE}`);
  }
}

// Validation Checks
if (!baseUrl) {
  throw new Error('[apiConfig] API_BASE_URL is not configured.');
}

if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  throw new Error(`[apiConfig] Invalid API URL protocol: ${baseUrl}`);
}

if (baseUrl.includes('/api/v1')) {
  throw new Error(`[apiConfig] API_BASE_URL should not include "/api/v1". It is appended by the services: ${baseUrl}`);
}

if (ENV === 'production' && baseUrl.startsWith('http://')) {
  throw new Error('[apiConfig] Cleartext HTTP is not allowed in production environments.');
}

export const API_BASE_URL = baseUrl;

export default {
  API_BASE_URL,
};

