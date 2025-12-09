import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = async (url: string) => {
  try {
    const res = await apiClient.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};