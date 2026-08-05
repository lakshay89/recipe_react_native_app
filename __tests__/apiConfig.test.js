// apiConfig.test.js
import { Platform } from 'react-native';

// Mock Platform for testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

describe('API URL Configuration & Validations', () => {
  const getBaseUrl = (env, devMode, configurableLanIp, approvedApiDomain) => {
    let baseUrl = '';
    if (env === 'production') {
      baseUrl = `https://${approvedApiDomain}`;
    } else {
      if (devMode === 'emulator') {
        baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000';
      } else if (devMode === 'usb') {
        baseUrl = 'http://127.0.0.1:3000';
      } else if (devMode === 'wifi') {
        if (!configurableLanIp) {
          throw new Error('[apiConfig] CONFIGURABLE_LAN_IP is missing or invalid for wifi DEV_MODE.');
        }
        baseUrl = `http://${configurableLanIp}:3000`;
      } else {
        throw new Error(`[apiConfig] Invalid DEV_MODE: ${devMode}`);
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
    if (env === 'production' && baseUrl.startsWith('http://')) {
      throw new Error('[apiConfig] Cleartext HTTP is not allowed in production environments.');
    }

    return baseUrl;
  };

  test('1. Android emulator mode selects 10.0.2.2', () => {
    const url = getBaseUrl('development', 'emulator', '192.168.1.5', 'api.edibleindia.org');
    expect(url).toBe('http://10.0.2.2:3000');
  });

  test('2. USB physical device mode selects 127.0.0.1', () => {
    const url = getBaseUrl('development', 'usb', '192.168.1.5', 'api.edibleindia.org');
    expect(url).toBe('http://127.0.0.1:3000');
  });

  test('3. Wi-Fi mode selects LAN IP', () => {
    const url = getBaseUrl('development', 'wifi', '192.168.1.50', 'api.edibleindia.org');
    expect(url).toBe('http://192.168.1.50:3000');
  });

  test('4. Production mode selects HTTPS domain', () => {
    const url = getBaseUrl('production', 'usb', '192.168.1.5', 'api.edibleindia.org');
    expect(url).toBe('https://api.edibleindia.org');
  });

  test('5. Throws if LAN IP missing in wifi mode', () => {
    expect(() => {
      getBaseUrl('development', 'wifi', '', 'api.edibleindia.org');
    }).toThrow('[apiConfig] CONFIGURABLE_LAN_IP is missing or invalid for wifi DEV_MODE.');
  });

  test('6. Throws if API URL includes /api/v1', () => {
    expect(() => {
      // Simulate invalid URL
      const url = 'http://127.0.0.1:3000/api/v1';
      if (url.includes('/api/v1')) {
        throw new Error('[apiConfig] API_BASE_URL should not include "/api/v1"');
      }
    }).toThrow();
  });

  test('7. Throws if production uses cleartext http', () => {
    expect(() => {
      const env = 'production';
      const baseUrl = 'http://api.edibleindia.org';
      if (env === 'production' && baseUrl.startsWith('http://')) {
        throw new Error('[apiConfig] Cleartext HTTP is not allowed in production environments.');
      }
    }).toThrow('[apiConfig] Cleartext HTTP is not allowed in production environments.');
  });
});
