import { DinosaurApiClient } from '../tools/api-client';
import { DinosaurTavilySearch } from '../tools/tavily-search';
import { InformationExtractor } from '../tools/information-extractor';
import { Dinosaur, DinosaurDetail } from '../types/dinosaur';

export class DinosaurResearchWorkflow {
  private searchTool: DinosaurTavilySearch;
  private extractor: InformationExtractor;
  private apiClient: DinosaurApiClient;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    tavilyApiKey: string,
    openaiApiKey: string,
    backendUrl: string = 'http://localhost:3000',
    maxRetries: number = 3,
    retryDelay: number = 2000,
    openaiModel?: string,
    openaiBaseUrl?: string,
  ) {
    this.searchTool = new DinosaurTavilySearch(tavilyApiKey);
    this.extractor = new InformationExtractor(
      openaiApiKey,
      openaiModel,
      openaiBaseUrl,
    );
    this.apiClient = new DinosaurApiClient(backendUrl);
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * 检查恐龙是否已存在
   */
  private async checkExisting(dinosaurName: string): Promise<boolean> {
    try {
      console.log(`🔍 检查恐龙是否已存在: ${dinosaurName}`);

      const exists = await this.apiClient.dinosaurExists(dinosaurName);

      if (exists) {
        console.log(`ℹ️ 恐龙已存在: ${dinosaurName}`);
      }

      return exists;
    } catch (error) {
      console.error('检查恐龙存在性时出错:', error);
      throw new Error(
        `检查恐龙存在性失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 搜索基本信息
   */
  private async searchBasicInfo(dinosaurName: string): Promise<any[]> {
    try {
      console.log(`🔍 搜索基本信息: ${dinosaurName}`);

      const results = await this.searchTool.searchDinosaur(dinosaurName);

      return results;
    } catch (error) {
      console.error('搜索基本信息时出错:', error);
      throw new Error(
        `搜索基本信息失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 搜索化石信息
   */
  private async searchFossils(dinosaurName: string): Promise<any[]> {
    try {
      console.log(`🔍 搜索化石信息: ${dinosaurName}`);

      const fossilResults = await this.searchTool.searchSpecificAspect(
        dinosaurName,
        'fossil discovery excavation paleontology',
      );

      return fossilResults;
    } catch (error) {
      console.error('搜索化石信息时出错:', error);
      throw new Error(
        `搜索化石信息失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 搜索图片信息
   */
  private async searchImages(
    dinosaurName: string,
  ): Promise<{ url: string; description?: string }[]> {
    try {
      console.log(`🔍 搜索图片信息: ${dinosaurName}`);

      const imageResults = await this.searchTool.searchImages(dinosaurName);
      return imageResults;
    } catch (error) {
      console.error('搜索图片信息时出错:', error);
      throw new Error(
        `搜索图片信息失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 提取信息（不包含化石信息）
   */
  private async extractInformationWithoutFossils(
    dinosaurName: string,
    basicSearchResults: any[],
  ): Promise<{
    basicInfo: Partial<Dinosaur>;
  }> {
    try {
      console.log(`🧠 提取信息（跳过化石信息）: ${dinosaurName}`);
      console.log(`📊 基本信息搜索结果数量: ${basicSearchResults.length}`);

      const basicInfo = await this.extractor.extractBasicInfo(
        dinosaurName,
        basicSearchResults,
      );

      return {
        basicInfo: basicInfo as Partial<Dinosaur>,
      };
    } catch (error) {
      console.error('提取信息时出错:', error);
      throw new Error(
        `信息提取失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 验证信息
   */
  private async validateInformation(
    dinosaurName: string,
    extractedInfo: Partial<Dinosaur>,
  ): Promise<Dinosaur> {
    try {
      console.log(`✅ 验证信息: ${dinosaurName}`);

      const validation =
        await this.extractor.validateAndCleanInfo(extractedInfo);

      if (!validation.isValid) {
        console.log(`⚠️ 信息验证失败: ${validation.errors.join(', ')}`);
        throw new Error(`信息验证失败: ${validation.errors.join(', ')}`);
      }

      return validation.cleanedInfo as Dinosaur;
    } catch (error) {
      console.error('验证信息时出错:', error);
      throw new Error(
        `信息验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 保存到数据库
   */
  private async saveToDatabase(
    dinosaurName: string,
    extractedInfo: Partial<Dinosaur>,
    extractedImages: { url: string; description?: string }[] = [],
  ): Promise<Dinosaur> {
    try {
      console.log(`💾 保存到数据库: ${dinosaurName}`);

      // 准备恐龙数据
      const dinosaurData = {
        name: extractedInfo.name || dinosaurName,
        scientific_name: extractedInfo.scientific_name || 'Unknown',
        period: extractedInfo.period || '未知',
        diet: extractedInfo.diet || '未知',
        length_min_meters: extractedInfo.length_min_meters ?? undefined,
        length_max_meters: extractedInfo.length_max_meters ?? undefined,
        weight_min_tons: extractedInfo.weight_min_tons ?? undefined,
        weight_max_tons: extractedInfo.weight_max_tons ?? undefined,
        habitat: extractedInfo.habitat,
        region: extractedInfo.region,
        description: extractedInfo.description,
      };

      // 检查是否存在同名恐龙（区分大小写，完全匹配）
      const existingDinosaur: DinosaurDetail | null =
        await this.apiClient.findDinosaurByExactName(dinosaurData.name);

      let savedDinosaur: DinosaurDetail;

      if (existingDinosaur && existingDinosaur.id) {
        // 如果存在，执行更新操作
        console.log(`🔄 发现同名恐龙，执行更新操作: ${dinosaurData.name}`);
        savedDinosaur = await this.apiClient.updateDinosaur(
          existingDinosaur.id,
          dinosaurData,
        );
      } else {
        // 如果不存在，创建新记录
        console.log(`➕ 创建新恐龙记录: ${dinosaurData.name}`);
        savedDinosaur = await this.apiClient.createDinosaur(dinosaurData);
      }

      // 添加图片信息
      if (savedDinosaur.id && extractedImages.length > 0) {
        await this.apiClient.addImages(savedDinosaur.id, extractedImages);
      }

      // 添加化石信息 - 暂时跳过
      // if (savedDinosaur.id && fossils && fossils.length > 0) {
      //   await this.apiClient.addFossils(savedDinosaur.id, fossils);
      // }

      console.log(`🎉 恐龙信息保存成功: ${dinosaurName}`);

      return savedDinosaur;
    } catch (error) {
      console.error('保存到数据库时出错:', error);
      throw new Error(
        `保存失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 重试机制包装器
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    dinosaurName: string,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(
          `🔄 ${operationName} (尝试 ${attempt}/${this.maxRetries}): ${dinosaurName}`,
        );
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `⚠️ ${operationName} 失败 (尝试 ${attempt}/${this.maxRetries}): ${lastError.message}`,
        );

        if (attempt < this.maxRetries) {
          console.log(`⏳ 等待 ${this.retryDelay}ms 后重试...`);
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    throw new Error(
      `${operationName} 在 ${this.maxRetries} 次尝试后仍然失败: ${lastError!.message}`,
    );
  }

  /**
   * 执行工作流
   */
  async execute(dinosaurName: string): Promise<any> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      console.log(`🚀 开始研究恐龙: ${dinosaurName}`);

      // 1. 搜索信息（添加图片信息搜索）
      const [basicResults, imageResults] = await Promise.allSettled([
        this.withRetry(
          () => this.searchBasicInfo(dinosaurName),
          '搜索基本信息',
          dinosaurName,
        ),
        this.withRetry<{ url: string; description?: string }[]>(
          () => this.searchImages(dinosaurName),
          '搜索图片信息',
          dinosaurName,
        ),
        // 暂时不搜索化石信息
        // this.withRetry(
        //   () => this.searchFossils(dinosaurName),
        //   '搜索化石信息',
        //   dinosaurName,
        // ),
      ]);

      // 处理搜索结果
      const allSearchResults: any[] = [];

      if (basicResults.status === 'fulfilled') {
        allSearchResults.push(...basicResults.value);
      } else {
        errors.push(`基本信息搜索失败: ${basicResults.reason}`);
      }

      // 处理图片搜索结果
      let extractedImages: { url: string; description?: string }[] = [];
      if (imageResults.status === 'fulfilled') {
        allSearchResults.push(...imageResults.value);
        // 提取图片URL
        extractedImages = imageResults.value;
      } else {
        errors.push(`图片信息搜索失败: ${imageResults.reason}`);
      }

      // 暂时跳过化石信息处理
      // if (fossilResults.status === 'fulfilled') {
      //   allSearchResults.push(...fossilResults.value);
      // } else {
      //   errors.push(`化石信息搜索失败: ${fossilResults.reason}`);
      // }

      if (allSearchResults.length === 0) {
        throw new Error('所有搜索都失败了，无法获取恐龙信息');
      }

      // 2. 提取信息（暂时跳过化石信息提取）
      const basicSearchResults =
        basicResults.status === 'fulfilled' ? basicResults.value : [];

      const extractedData = await this.withRetry(
        () =>
          this.extractInformationWithoutFossils(
            dinosaurName,
            basicSearchResults,
          ),
        '提取信息',
        dinosaurName,
      );
      const { basicInfo } = extractedData;

      // 3. 验证信息

      // 3. 验证信息
      const validatedInfo = await this.withRetry(
        () => this.validateInformation(dinosaurName, basicInfo),
        '验证信息',
        dinosaurName,
      );

      // 4. 保存到数据库
      const savedData: Dinosaur = await this.withRetry(
        () => this.saveToDatabase(dinosaurName, validatedInfo, extractedImages),
        '保存到数据库',
        dinosaurName,
      );

      const processingTime = Date.now() - startTime;
      console.log(`✅ 工作流完成: ${dinosaurName} (耗时: ${processingTime}ms)`);

      // 返回结构化数据，包含保存结果
      return {
        success: true,
        data: {
          basicInfo: validatedInfo,
          savedData,
          images: extractedImages, // 添加图片URL
        },
        errors: errors.length > 0 ? errors : undefined,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(
        `❌ 工作流执行失败: ${dinosaurName} (耗时: ${processingTime}ms)`,
        error,
      );

      return {
        success: false,
        error: errorMessage,
        errors: [...errors, errorMessage],
        processingTime,
      };
    }
  }
}

export default DinosaurResearchWorkflow;
