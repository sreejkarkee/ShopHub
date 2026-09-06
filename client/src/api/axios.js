import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default axios.create({
  baseURL: apiBaseUrl,
});