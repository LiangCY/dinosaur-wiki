import {
  tavily,
  TavilyClient,
  TavilySearchOptions,
  TavilySearchResponse,
} from '@tavily/core';
import { SearchResult } from '../types/dinosaur';

// 定义搜索结果的类型接口
interface SearchResultWithSnippet {
  title?: string;
  url?: string;
  content?: string;
  snippet?: string;
  score?: number;
}

export class DinosaurTavilySearch {
  private client: TavilyClient;
  private maxResults: number;

  constructor(apiKey: string, maxResults: number = 2) {
    this.client = tavily({ apiKey });
    this.maxResults = maxResults;
  }

  /**
   * 搜索恐龙相关信息
   */
  async searchDinosaur(dinosaurName: string): Promise<SearchResult[]> {
    try {
      const query = `${dinosaurName} dinosaur paleontology fossil habitat diet period`;
      console.log(`🔍 搜索恐龙信息: ${query}`);

      const results = await this.client.search(query, {
        searchDepth: 'advanced',
        maxResults: this.maxResults,
        includeAnswer: true,
        includeRawContent: 'markdown',
        includeDomains: [
          'wikipedia.org',
          'britannica.com',
          'nationalgeographic.com',
          'smithsonianmag.com',
          'livescience.com',
          'sciencedirect.com',
          'nature.com',
          'plos.org',
        ],
      });

      return this.formatResults(results);
    } catch (error) {
      console.error('搜索恐龙信息时出错:', error);
      throw new Error(
        `搜索失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 搜索特定方面的恐龙信息
   */
  async searchSpecificAspect(
    dinosaurName: string,
    aspect: string,
    options?: Partial<TavilySearchOptions>,
  ): Promise<SearchResult[]> {
    try {
      const query = `${dinosaurName} dinosaur ${aspect}`;
      console.log(`🔍 搜索特定信息: ${query}`);

      const results = await this.client.search(query, {
        searchDepth: 'advanced',
        maxResults: this.maxResults,
        includeAnswer: true,
        includeRawContent: 'markdown',
        ...options,
      });

      return this.formatResults(results);
    } catch (error) {
      console.error(`搜索${aspect}信息时出错:`, error);
      return [];
    }
  }

  /**
   * 搜索恐龙图片
   */
  async searchImages(
    dinosaurName: string,
  ): Promise<TavilySearchResponse['images']> {
    try {
      const query = `${dinosaurName} dinosaur scientific image`;
      console.log(`🔍 搜索图片信息: ${query}`);

      const results = await this.client.search(query, {
        searchDepth: 'advanced',
        maxResults: this.maxResults,
        includeAnswer: true,
        includeRawContent: 'markdown',
        includeImages: true,
        includeImageDescriptions: true,
        includeDomains: [
          'wikipedia.org',
          'britannica.com',
          'nationalgeographic.com',
          'smithsonianmag.com',
          'livescience.com',
        ],
      });

      return results.images;
    } catch (error) {
      console.error(`搜索图片出错:`, error);
      return [];
    }
  }

  /**
   * 验证恐龙信息的准确性
   */
  async verifyInformation(
    dinosaurName: string,
    claim: string,
  ): Promise<SearchResult[]> {
    try {
      const query = `${dinosaurName} dinosaur "${claim}" scientific evidence`;
      console.log(`🔍 验证信息: ${query}`);

      const results = await this.client.search(query, {
        searchDepth: 'advanced',
        maxResults: this.maxResults,
        includeAnswer: true,
        includeRawContent: 'markdown',
      });

      return this.formatResults(results);
    } catch (error) {
      console.error('验证信息时出错:', error);
      return [];
    }
  }

  /**
   * 格式化搜索结果
   */
  private formatResults(results: TavilySearchResponse): SearchResult[] {
    if (!results || !results.results || !Array.isArray(results.results)) {
      return [];
    }

    return results.results
      .map((result) => ({
        title: result.title || '',
        url: result.url || '',
        content:
          (result as SearchResultWithSnippet & { rawContent?: string })
            .rawContent ||
          result.content ||
          String((result as SearchResultWithSnippet)?.snippet || ''),
        score: result.score || 0,
      }))
      .filter((result) => result.title && result.url && result.content);
  }

  /**
   * 获取搜索建议
   */
  getSearchSuggestions(dinosaurName: string): string[] {
    const baseName = dinosaurName.toLowerCase();
    return [
      `${baseName} habitat environment`,
      `${baseName} diet feeding behavior`,
      `${baseName} fossil discoveries`,
      `${baseName} geological period`,
      `${baseName} size weight dimensions`,
      `${baseName} behavior social structure`,
      `${baseName} evolution phylogeny`,
    ];
  }
}

export default DinosaurTavilySearch;
