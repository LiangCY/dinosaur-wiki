import { DinosaurResearchWorkflow } from '../workflows/dinosaur-research-workflow';
import { DinosaurApiClient } from '../tools/api-client';
import { DinosaurTavilySearch } from '../tools/tavily-search';
import { InformationExtractor } from '../tools/information-extractor';

export interface AgentConfig {
  openaiApiKey?: string;
  openaiModel?: string;
  openaiBaseUrl?: string;
  tavilyApiKey?: string;
  backendUrl?: string;
  maxRetries?: number;
  timeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface ResearchResult {
  success: boolean;
  dinosaur?: any;
  error?: string;
  errors?: string[];
  processingTime?: number;
}

export class DinosaurAgent {
  private workflow: DinosaurResearchWorkflow;
  private apiClient: DinosaurApiClient;
  private searchTool: DinosaurTavilySearch;
  private extractor: InformationExtractor;
  private config: Required<Omit<AgentConfig, 'openaiBaseUrl'>> & {
    openaiBaseUrl?: string;
  };

  constructor(config: AgentConfig = {}) {
    // 从环境变量读取配置，优先使用传入的配置
    this.config = {
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY || '',
      openaiModel:
        config.openaiModel || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      openaiBaseUrl: config.openaiBaseUrl || process.env.OPENAI_BASE_URL,
      tavilyApiKey: config.tavilyApiKey || process.env.TAVILY_API_KEY || '',
      backendUrl:
        config.backendUrl ||
        process.env.AI_AGENT_BACKEND_URL ||
        'http://localhost:3000',
      maxRetries:
        config.maxRetries || parseInt(process.env.AI_AGENT_MAX_RETRIES || '3'),
      timeout:
        config.timeout || parseInt(process.env.AI_AGENT_TIMEOUT || '60000'),
      logLevel: (config.logLevel ||
        process.env.AI_AGENT_LOG_LEVEL ||
        'info') as 'debug' | 'info' | 'warn' | 'error',
    };

    // 验证必需的配置
    this.validateConfig();

    // 初始化组件
    this.apiClient = new DinosaurApiClient(this.config.backendUrl);
    this.searchTool = new DinosaurTavilySearch(this.config.tavilyApiKey);
    this.extractor = new InformationExtractor(
      this.config.openaiApiKey,
      this.config.openaiModel,
      this.config.openaiBaseUrl,
    );
    this.workflow = new DinosaurResearchWorkflow(
      this.config.tavilyApiKey,
      this.config.openaiApiKey,
      this.config.backendUrl,
      this.config.maxRetries,
      2000, // 重试延迟 2 秒
      this.config.openaiModel,
      this.config.openaiBaseUrl,
    );

    this.log('info', '🤖 DinosaurAgent 初始化完成');
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API Key 是必需的');
    }
    if (!this.config.tavilyApiKey) {
      throw new Error('Tavily API Key 是必需的');
    }
    if (!this.config.backendUrl) {
      throw new Error('后端 URL 是必需的');
    }
  }

  /**
   * 日志记录
   */
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    ...args: any[]
  ): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logLevel];
    const messageLevel = levels[level];

    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      console.log(`${prefix} ${message}`, ...args);
    }
  }

  /**
   * 研究单个恐龙
   */
  async researchDinosaur(dinosaurName: string): Promise<ResearchResult> {
    const startTime = Date.now();
    this.log('info', `🦕 开始研究恐龙: ${dinosaurName}`);

    try {
      // 执行工作流
      const result = await this.workflow.execute(dinosaurName);
      const processingTime = Date.now() - startTime;

      if (result && !result.error) {
        this.log(
          'info',
          `✅ 恐龙研究完成: ${dinosaurName} (耗时: ${processingTime}ms)`,
        );
        return {
          success: true,
          dinosaur: result,
          processingTime,
        };
      } else {
        this.log('warn', `⚠️ 恐龙研究失败: ${dinosaurName}`, result);
        return {
          success: false,
          error: result?.message || '研究失败',
          errors: result?.errors || [],
          processingTime,
        };
      }
    } catch (error: unknown) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.log('error', `❌ 恐龙研究失败: ${dinosaurName}`, error);
      return {
        success: false,
        error: errorMessage,
        errors: [errorMessage],
        processingTime,
      };
    }
  }

  /**
   * 批量研究恐龙
   */
  async researchDinosaurs(dinosaurNames: string[]): Promise<ResearchResult[]> {
    this.log('info', `🦕 开始批量研究恐龙: ${dinosaurNames.join(', ')}`);
    const results: ResearchResult[] = [];

    for (const name of dinosaurNames) {
      try {
        const result = await this.researchDinosaur(name);
        results.push(result);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        this.log('error', `❌ 批量研究恐龙失败: ${name}`, error);
        results.push({
          success: false,
          error: errorMessage,
          errors: [errorMessage],
          processingTime: 0,
        });
      }
    }

    return results;
  }

  /**
   * 获取代理统计信息
   */
  async getStats(): Promise<any> {
    return {
      totalDinosaurs: 0,
      recentActivity: [],
      systemStatus: 'running',
    };
  }

  /**
   * 获取代理配置
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * 更新代理配置
   */
  updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // 重新初始化需要配置的组件
    if (newConfig.backendUrl) {
      this.apiClient = new DinosaurApiClient(this.config.backendUrl);
    }
    if (newConfig.tavilyApiKey) {
      this.searchTool = new DinosaurTavilySearch(this.config.tavilyApiKey);
    }
    if (
      newConfig.openaiApiKey ||
      newConfig.openaiModel ||
      newConfig.openaiBaseUrl
    ) {
      this.extractor = new InformationExtractor(
        this.config.openaiApiKey,
        this.config.openaiModel,
        this.config.openaiBaseUrl,
      );
    }
    if (
      newConfig.tavilyApiKey ||
      newConfig.openaiApiKey ||
      newConfig.backendUrl ||
      newConfig.maxRetries ||
      newConfig.openaiModel ||
      newConfig.openaiBaseUrl
    ) {
      this.workflow = new DinosaurResearchWorkflow(
        this.config.tavilyApiKey,
        this.config.openaiApiKey,
        this.config.backendUrl,
        this.config.maxRetries,
        2000, // 重试延迟 2 秒
        this.config.openaiModel,
        this.config.openaiBaseUrl,
      );
    }
  }
}

export default DinosaurAgent;
