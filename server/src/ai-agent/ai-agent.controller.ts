import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { DinosaurAgent, ResearchResult } from './agents/dinosaur-agent';

export class ResearchDinosaurDto {
  dinosaur_name: string;
}

export class BatchResearchDto {
  dinosaur_names: string[];
}

export class AgentConfigDto {
  backendUrl?: string;
  maxRetries?: number;
  timeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

@ApiTags('AI-Agent')
@Controller('ai-agent')
export class AiAgentController {
  private agent: DinosaurAgent | null = null;

  constructor() {
    // 自动初始化 Agent
    this.autoInitialize();
  }

  /**
   * 自动初始化 Agent
   */
  private autoInitialize() {
    try {
      this.agent = new DinosaurAgent();
      console.log('🤖 AI-Agent 已自动初始化');
    } catch (error) {
      console.warn('⚠️ AI-Agent 自动初始化失败:', error);
    }
  }

  /**
   * 研究单个恐龙
   */
  @Post('research')
  @ApiOperation({ summary: '研究单个恐龙信息' })
  @ApiBody({ type: ResearchDinosaurDto })
  @ApiResponse({ status: 200, description: '恐龙研究结果' })
  @ApiResponse({ status: 400, description: 'AI-Agent未初始化或参数错误' })
  async researchDinosaur(
    @Body() body: ResearchDinosaurDto,
  ): Promise<ResearchResult> {
    if (!this.agent) {
      throw new HttpException('AI-Agent 未初始化', HttpStatus.BAD_REQUEST);
    }

    if (!body.dinosaur_name || body.dinosaur_name.trim() === '') {
      throw new HttpException('恐龙名称不能为空', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.agent.researchDinosaur(
        body.dinosaur_name.trim(),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        `恐龙研究失败: ${error instanceof Error ? error.message : '未知错误'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 批量研究恐龙
   */
  @Post('research/batch')
  @ApiOperation({ summary: '批量研究恐龙信息' })
  @ApiBody({ type: BatchResearchDto })
  @ApiResponse({ status: 200, description: '批量恐龙研究结果' })
  @ApiResponse({ status: 400, description: 'AI-Agent未初始化或参数错误' })
  async batchResearchDinosaurs(
    @Body() body: BatchResearchDto,
  ): Promise<ResearchResult[]> {
    if (!this.agent) {
      throw new HttpException('AI-Agent 未初始化', HttpStatus.BAD_REQUEST);
    }

    if (
      !body.dinosaur_names ||
      !Array.isArray(body.dinosaur_names) ||
      body.dinosaur_names.length === 0
    ) {
      throw new HttpException('恐龙名称列表不能为空', HttpStatus.BAD_REQUEST);
    }

    // 验证恐龙名称
    const validNames = body.dinosaur_names.filter(
      (name) => name && name.trim() !== '',
    );
    if (validNames.length === 0) {
      throw new HttpException('没有有效的恐龙名称', HttpStatus.BAD_REQUEST);
    }

    // 限制批量处理数量
    if (validNames.length > 10) {
      throw new HttpException(
        '批量处理最多支持10个恐龙',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const results = await this.agent.researchDinosaurs(validNames);
      return results;
    } catch (error) {
      throw new HttpException(
        `批量恐龙研究失败: ${error instanceof Error ? error.message : '未知错误'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取AI-Agent状态
   */
  @Get('status')
  @ApiOperation({ summary: '获取AI-Agent状态' })
  @ApiResponse({ status: 200, description: 'AI-Agent状态信息' })
  async getStatus() {
    if (!this.agent) {
      return {
        initialized: false,
        message: 'AI-Agent 未初始化',
      };
    }

    try {
      const stats = await this.agent.getStats();
      const config = this.agent.getConfig();

      return {
        initialized: true,
        config,
        stats,
        message: 'AI-Agent 运行正常',
      };
    } catch (error) {
      return {
        initialized: true,
        error: error instanceof Error ? error.message : '获取状态失败',
        message: 'AI-Agent 状态异常',
      };
    }
  }

  /**
   * 获取推荐的恐龙列表
   */
  @Get('recommendations')
  @ApiOperation({ summary: '获取推荐研究的恐龙列表' })
  @ApiQuery({ name: 'count', required: false, description: '推荐数量，默认10' })
  @ApiResponse({ status: 200, description: '推荐的恐龙列表' })
  getRecommendations(@Query('count') count: string = '10') {
    const recommendedDinosaurs = [
      '霸王龙',
      '三角龙',
      '剑龙',
      '腕龙',
      '迅猛龙',
      '翼龙',
      '雷龙',
      '棘龙',
      '异特龙',
      '副栉龙',
      '甲龙',
      '慈母龙',
      '重爪龙',
      '巨兽龙',
      '食肉牛龙',
      '双冠龙',
      '角鼻龙',
      '始祖鸟',
      '恐爪龙',
      '暴龙',
    ];

    const requestedCount = Math.min(parseInt(count) || 10, 20);
    const shuffled = recommendedDinosaurs.sort(() => 0.5 - Math.random());

    return {
      success: true,
      recommendations: shuffled.slice(0, requestedCount),
      total: requestedCount,
      message: `推荐 ${requestedCount} 个恐龙进行研究`,
    };
  }
}
