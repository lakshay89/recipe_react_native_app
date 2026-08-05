import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../core/config/apiConfig';

let _accessToken = null;
let _refreshToken = null;
let _isRefreshing = false;
let _refreshSubscribers = [];

const onTokenRefreshed = (accessToken) => {
  _refreshSubscribers.forEach(cb => cb(accessToken));
  _refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  _refreshSubscribers.push(cb);
};

export const tokenStorage = {
  async loadTokens() {
    try {
      _accessToken = await AsyncStorage.getItem('@edible_india_access_token');
      _refreshToken = await AsyncStorage.getItem('@edible_india_refresh_token');
    } catch (e) {
      console.error('Failed to load tokens from storage', e);
    }
  },

  async setTokens(accessToken, refreshToken) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    try {
      if (accessToken) {
        await AsyncStorage.setItem('@edible_india_access_token', accessToken);
      } else {
        await AsyncStorage.removeItem('@edible_india_access_token');
      }
      if (refreshToken) {
        await AsyncStorage.setItem('@edible_india_refresh_token', refreshToken);
      } else {
        await AsyncStorage.removeItem('@edible_india_refresh_token');
      }
    } catch (e) {
      console.error('Failed to save tokens to storage', e);
    }
  },

  getAccessToken() {
    return _accessToken;
  },

  getRefreshToken() {
    return _refreshToken;
  },

  async clearTokens() {
    _accessToken = null;
    _refreshToken = null;
    try {
      await Promise.all([
        AsyncStorage.removeItem('@edible_india_access_token'),
        AsyncStorage.removeItem('@edible_india_refresh_token')
      ]);
    } catch (e) {
      console.error('Failed to clear tokens from storage', e);
    }
  }
};

export const apiClient = {
  async fetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // If 401 Unauthorized, token might be expired. Try to refresh.
      if (response.status === 401 && tokenStorage.getRefreshToken()) {
        if (!_isRefreshing) {
          _isRefreshing = true;
          tokenRefresh()
            .then(newAccessToken => {
              _isRefreshing = false;
              onTokenRefreshed(newAccessToken);
            })
            .catch(err => {
              console.error('Session expired, logging out', err);
              _isRefreshing = false;
              _refreshSubscribers = [];
              tokenStorage.clearTokens();
              if (global.onAuthExpired) {
                global.onAuthExpired();
              }
            });
        }

        const retryOrigRequest = new Promise((resolve, reject) => {
          addRefreshSubscriber(newAccessToken => {
            config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            fetch(url, config)
              .then(resolve)
              .catch(reject);
          });
        });

        return retryOrigRequest;
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
};

async function tokenRefresh() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    throw new Error('Refresh token rotation failed');
  }

  const resJson = await response.json();
  if (resJson.success && resJson.data.tokens) {
    const { accessToken: newAccess, refreshToken: newRefresh } = resJson.data.tokens;
    await tokenStorage.setTokens(newAccess, newRefresh);
    return newAccess;
  }

  throw new Error('Refresh token rotation returned invalid payload');
}
