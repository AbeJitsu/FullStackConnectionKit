import axios from 'axios';

const axiosInstance = axios.create({
  withCredentials: true,
});

export const apiCall = async (method, url, data = null) => {
  try {
    console.log(`Making ${method.toUpperCase()} request to ${url}`);
    if (data) {
      console.log('Request data:', JSON.stringify(data, null, 2));
    }
    const response = await axiosInstance[method](url, data);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error in API call (${method} ${url}):`, error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const getApiUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction
    ? process.env.VUE_APP_API_URL_CLOUD
    : process.env.VUE_APP_API_URL_LOCAL;
};
