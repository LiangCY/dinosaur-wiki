import axios from 'axios';
import type { Dinosaur, DinosaurDetail } from '../types/dinosaur';

const API_BASE_URL = '/api';

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
    const response = await api.get(
      `/dinosaurs/search?q=${encodeURIComponent(query)}`,
    );
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

  // 更新恐龙数据
  updateDinosaur: async (
    id: string,
    dinosaur: Partial<Dinosaur>,
  ): Promise<Dinosaur> => {
    const response = await api.put(`/dinosaurs/${id}`, dinosaur);
    return response.data;
  },

  // 删除恐龙
  deleteDinosaur: async (id: string): Promise<void> => {
    await api.delete(`/dinosaurs/${id}`);
  },

  // 获取恐龙图片
  getDinosaurImages: async (
    id: string,
  ): Promise<{ url: string; description?: string }[]> => {
    const response = await api.get(`/dinosaurs/${id}/images`);
    return response.data;
  },

  // 添加恐龙图片
  addDinosaurImages: async (
    id: string,
    images: { url: string; description?: string }[],
  ): Promise<void> => {
    await api.post(`/dinosaurs/${id}/images`, { images });
  },

  // 删除恐龙图片
  deleteDinosaurImage: async (id: string, url: string): Promise<void> => {
    await api.delete(`/dinosaurs/${id}/images`, { data: { url } });
  },
};

export default api;
