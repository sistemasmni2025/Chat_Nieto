import axios from 'axios';
import { Platform } from 'react-native';

// Si estás en emulador de Android: 10.0.2.2
// Si estás en dispositivo real: Usa tu IP local (ej. 172.16.71.200)
const BASE_URL = Platform.select({
  android: 'http://172.16.71.200:8000/api',
  ios: 'http://172.16.71.200:8000/api',
  default: 'http://localhost:8000/api',
});

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export const chatApi = {
  sendMessage: (mensaje, historial = [], modelo = 'Razonamiento') => {
    return apiClient.post('/chat', { mensaje, historial, modelo });
  },
  uploadFiles: (formData) => {
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  transcribeAudio: (formData) => {
    return apiClient.post('/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAudioUrl: (text) => `${BASE_URL}/tts?text=${encodeURIComponent(text)}`,
  getNews: () => {
    return apiClient.get('/news');
  },
};

export default apiClient;
