export const API_BASE_URL = 'https://confeccionesesperanza-api-dac0aua2c0dbhzch.eastus2-01.azurewebsites.net';

export const apiUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
