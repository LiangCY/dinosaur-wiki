import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DinosaurDetail } from '../types/dinosaur';

export interface DinosaurCreateDto {
  name: string;
  scientific_name: string;
  period: string;
  diet: string;
  length_meters?: number;
  weight_tons?: number;
  habitat?: string;
  region?: string;
  description?: string;
  image_url?: string;
}

export interface DinosaurFossilDto {
  discovery_location: string;
  discovery_date?: string;
  fossil_type: string;
  description?: string;
  image_url?: string;
}

export class DinosaurApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `🌐 API请求: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        console.error('API请求错误:', error);
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API响应: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(
          `❌ API错误: ${error.response?.status} ${error.config?.url}`,
          error.response?.data,
        );
        return Promise.reject(error);
      },
    );
  }

  /**
   * 获取所有恐龙列表
   */
  async getDinosaurs(): Promise<DinosaurDetail[]> {
    try {
      const response: AxiosResponse<DinosaurDetail[]> =
        await this.client.get('/dinosaurs');
      return response.data;
    } catch (error) {
      console.error('获取恐龙列表失败:', error);
      throw new Error(`获取恐龙列表失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 根据ID获取恐龙详情
   */
  async getDinosaurById(id: number): Promise<DinosaurDetail | null> {
    try {
      const response: AxiosResponse<DinosaurDetail> = await this.client.get(
        `/dinosaurs/${id}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error(`获取恐龙详情失败 (ID: ${id}):`, error);
      throw new Error(`获取恐龙详情失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 搜索恐龙
   */
  async searchDinosaurs(query: string): Promise<DinosaurDetail[]> {
    try {
      const response: AxiosResponse<DinosaurDetail[]> = await this.client.get(
        '/dinosaurs/search',
        {
          params: { q: query },
        },
      );
      return response.data;
    } catch (error) {
      console.error(`搜索恐龙失败 (查询: ${query}):`, error);
      throw new Error(`搜索恐龙失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 检查恐龙是否存在
   */
  async dinosaurExists(name: string): Promise<boolean> {
    try {
      const dinosaurs = await this.searchDinosaurs(name);
      return dinosaurs.some(
        (d) =>
          d.name.toLowerCase() === name.toLowerCase() ||
          d.scientific_name?.toLowerCase() === name.toLowerCase(),
      );
    } catch (error) {
      console.error(`检查恐龙是否存在失败 (名称: ${name}):`, error);
      return false;
    }
  }

  /**
   * 根据名称精确查找恐龙（区分大小写）
   */
  async findDinosaurByExactName(name: string): Promise<DinosaurDetail | null> {
    try {
      const dinosaurs = await this.getDinosaurs();
      const found = dinosaurs.find((d) => d.name === name);
      return found || null;
    } catch (error) {
      console.error(`精确查找恐龙失败 (名称: ${name}):`, error);
      return null;
    }
  }

  /**
   * 创建新恐龙
   */
  async createDinosaur(
    dinosaurData: DinosaurCreateDto,
  ): Promise<DinosaurDetail> {
    try {
      const response: AxiosResponse<DinosaurDetail> = await this.client.post(
        '/dinosaurs',
        dinosaurData,
      );
      console.log(`✅ 恐龙创建成功: ${dinosaurData.name}`);
      return response.data;
    } catch (error) {
      console.error(`创建恐龙失败 (名称: ${dinosaurData.name}):`, error);
      throw new Error(`创建恐龙失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 更新恐龙信息
   */
  async updateDinosaur(
    id: number,
    dinosaurData: Partial<DinosaurCreateDto>,
  ): Promise<DinosaurDetail> {
    try {
      const response: AxiosResponse<DinosaurDetail> = await this.client.put(
        `/dinosaurs/${String(id)}`,
        dinosaurData,
      );
      console.log(`✅ 恐龙更新成功: ID ${id}`);
      return response.data;
    } catch (error) {
      console.error(`更新恐龙失败 (ID: ${id}):`, error);
      throw new Error(`更新恐龙失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 为恐龙添加化石信息
   */
  async addFossils(
    dinosaurId: number,
    fossils: DinosaurFossilDto[],
  ): Promise<void> {
    try {
      await this.client.post(`/dinosaurs/${dinosaurId}/fossils`, { fossils });
      console.log(`✅ 化石信息添加成功: 恐龙ID ${dinosaurId}`);
    } catch (error) {
      console.error(`添加化石信息失败 (恐龙ID: ${dinosaurId}):`, error);
      throw new Error(`添加化石信息失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 为恐龙添加图片信息
   */
  async addImages(
    dinosaurId: number,
    images: { url: string; description?: string }[],
  ): Promise<void> {
    try {
      await this.client.post(`/dinosaurs/${dinosaurId}/images`, { images });
      console.log(`✅ 图片信息添加成功: 恐龙ID ${dinosaurId}`);
    } catch (error) {
      console.error(`添加图片信息失败 (恐龙ID: ${dinosaurId}):`, error);
      throw new Error(`添加图片信息失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 批量创建恐龙
   */
  async createDinosaurs(
    dinosaursData: DinosaurCreateDto[],
  ): Promise<DinosaurDetail[]> {
    try {
      const response: AxiosResponse<DinosaurDetail[]> = await this.client.post(
        '/dinosaurs/batch',
        {
          dinosaurs: dinosaursData,
        },
      );
      console.log(`✅ 批量创建恐龙成功: ${dinosaursData.length} 个`);
      return response.data;
    } catch (error) {
      console.error(`批量创建恐龙失败:`, error);
      throw new Error(`批量创建恐龙失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 删除恐龙
   */
  async deleteDinosaur(id: number): Promise<void> {
    try {
      await this.client.delete(`/dinosaurs/${id}`);
      console.log(`✅ 恐龙删除成功: ID ${id}`);
    } catch (error) {
      console.error(`删除恐龙失败 (ID: ${id}):`, error);
      throw new Error(`删除恐龙失败: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * 获取错误信息
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      if (error.response?.statusText) {
        return error.response.statusText;
      }
      if (error.message) {
        return error.message;
      }
    }
    return error instanceof Error ? error.message : '未知错误';
  }

  /**
   * 设置请求超时时间
   */
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  /**
   * 设置基础URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }
}

export default DinosaurApiClient;
