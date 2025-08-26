import axios from 'axios';
import type { Dinosaur, DinosaurDetail } from '../types/dinosaur';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const dinosaurApi = {
  // 获取所有恐龙列表
  getAllDinosaurs: async (): Promise<Dinosaur[]> => {
    const response = await api.get('/dinosaurs');
    return response.data;
  },

  // 根据ID获取恐龙详情
  getDinosaurById: async (id: string): Promise<DinosaurDetail> => {
    const response = await api.get(`/dinosaurs/${id}`);
    return response.data;
  },

  // 搜索恐龙
  searchDinosaurs: async (query: string): Promise<Dinosaur[]> => {
    const response = await api.get(`/dinosaurs/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // 根据时期筛选恐龙
  getDinosaursByPeriod: async (period: string): Promise<Dinosaur[]> => {
    const response = await api.get(`/dinosaurs/period/${period}`);
    return response.data;
  },

  // 根据饮食习惯筛选恐龙
  getDinosaursByDiet: async (diet: string): Promise<Dinosaur[]> => {
    const response = await api.get(`/dinosaurs/diet/${diet}`);
    return response.data;
  },
};

export default api;