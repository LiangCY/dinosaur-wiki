import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import {
  SearchResult,
  DinosaurDetail,
  DinosaurFossil,
} from '../types/dinosaur';

export class InformationExtractor {
  private llm: ChatOpenAI;
  private parser: JsonOutputParser;

  constructor(openaiApiKey?: string, model?: string, baseUrl?: string) {
    const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
    const modelName = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const openaiBaseUrl = baseUrl || process.env.OPENAI_BASE_URL;

    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required. Please provide it as parameter or set OPENAI_API_KEY environment variable.',
      );
    }

    const config = {
      apiKey,
      model: modelName,
      temperature: 0.1,
      ...(openaiBaseUrl && {
        configuration: {
          baseURL: openaiBaseUrl,
        },
      }),
    };

    this.llm = new ChatOpenAI(config);
    this.parser = new JsonOutputParser();
  }

  /**
   * 从搜索结果中提取恐龙基本信息
   */
  async extractBasicInfo(
    dinosaurName: string,
    searchResults: SearchResult[],
  ): Promise<Partial<DinosaurDetail>> {
    const prompt = PromptTemplate.fromTemplate(`
你是一个专业的古生物学信息提取专家。请从以下搜索结果中提取关于恐龙 "{dinosaur_name}" 的准确信息。

搜索结果：
{search_results}

请提取以下信息并以JSON格式返回：
{{
  "name": "恐龙的中文名称",
  "scientific_name": "恐龙的学名（拉丁文）",
  "period": "地质时期（如：白垩纪晚期、侏罗纪中期等）",
  "diet": "饮食类型（肉食性/植食性/杂食性）",
  "length_min_meters": 最小体长（米，数字），
  "length_max_meters": 最大体长（米，数字），
  "weight_min_tons": 最小体重（吨，数字），
  "weight_max_tons": 最大体重（吨，数字），
  "habitat": "栖息环境描述",
  "region": "主要分布地区",
  "description": "详细描述（至少100字）"
}}

注意事项：
1. 只提取确认的科学信息，不确定的信息请留空
2. 数字信息必须是准确的数值
3. 地质时期要使用中文标准术语
4. 描述要客观、准确、详细
5. 如果信息不足，相应字段可以为null
`);

    try {
      // 限制搜索结果数量和内容长度以避免 token 超限
      const limitedResults = searchResults
        .slice(0, 5) // 只取前5个结果
        .map((r) => ({
          title: r.title,
          content: r.content.substring(0, 20000),
          url: r.url,
        }));

      const formattedResults = limitedResults
        .map((r) => `标题: ${r.title}\n内容: ${r.content}\n来源: ${r.url}\n---`)
        .join('\n');

      const chain = prompt.pipe(this.llm).pipe(this.parser);
      const result = await chain.invoke({
        dinosaur_name: dinosaurName,
        search_results: formattedResults,
      });

      console.log(`✅ 提取基本信息完成: ${dinosaurName}`, result);
      return result as Partial<DinosaurDetail>;
    } catch (error) {
      console.error('提取基本信息时出错:', error);
      throw new Error(
        `信息提取失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 提取化石发现信息
   */
  async extractFossils(
    dinosaurName: string,
    searchResults: SearchResult[],
  ): Promise<
    Array<{
      discovery_location: string;
      discovery_date?: string;
      fossil_type: string;
      description?: string;
    }>
  > {
    const prompt = PromptTemplate.fromTemplate(`
你是一个专业的古生物学化石研究专家。请从以下搜索结果中提取关于恐龙 "{dinosaur_name}" 的化石发现信息。

搜索结果：
{search_results}

请提取化石信息并以JSON数组格式返回：
[
  {{
    "discovery_location": "发现地点（具体地名）",
    "discovery_date": "发现日期（YYYY-MM-DD格式，如果只有年份则YYYY格式）",
    "fossil_type": "化石类型（如：完整骨架、头骨、牙齿等）",
    "description": "化石描述和重要性"
  }}
]

化石类型包括：
- 完整骨架、部分骨架
- 头骨、牙齿、爪子
- 蛋化石、足迹化石
- 皮肤印痕、羽毛化石
- 其他特殊化石

注意事项：
1. 发现地点要具体到国家、地区或地层
2. 日期格式要标准化
3. 描述要包含化石的科学价值
4. 只提取确认的发现记录
`);

    try {
      // 限制搜索结果数量和内容长度以避免 token 超限
      const limitedResults = searchResults
        .slice(0, 3) // 只取前3个结果
        .map((r) => ({
          title: r.title,
          content: r.content.substring(0, 5000), // 限制内容长度为500字符
          url: r.url,
        }));

      const formattedResults = limitedResults
        .map((r) => `标题: ${r.title}\n内容: ${r.content}\n---`)
        .join('\n');

      const chain = prompt.pipe(this.llm).pipe(this.parser);
      const result = await chain.invoke({
        dinosaur_name: dinosaurName,
        search_results: formattedResults,
      });

      console.log(`✅ 提取化石信息完成: ${dinosaurName}`);
      return (Array.isArray(result) ? result : []) as DinosaurFossil[];
    } catch (error) {
      console.error('提取化石信息时出错:', error);
      return [];
    }
  }

  /**
   * 提取图片URL
   */
  async extractImageUrls(
    dinosaurName: string,
    searchResults: SearchResult[],
  ): Promise<string[]> {
    const prompt = PromptTemplate.fromTemplate(`
你是一个专业的古生物学图片识别专家。请从以下搜索结果中提取关于恐龙 "${dinosaurName}" 的相关图片URL。

搜索结果：
{search_results}

请提取高质量、相关的图片URL并以JSON数组格式返回：
["图片URL1", "图片URL2", ...]

要求：
1. 只提取与 "${dinosaurName}" 直接相关的图片
2. 优先选择高清晰度、科学准确的图片
3. 避免图标、示意图、不相关的图片
4. 确保URL完整且可访问
5. 最多提取5张图片
`);

    try {
      // 限制搜索结果数量和内容长度以避免 token 超限
      const limitedResults = searchResults
        .slice(0, 3) // 只取前3个结果
        .map((r) => ({
          title: r.title,
          content: r.content.substring(0, 10000),
          url: r.url,
        }));

      const formattedResults = limitedResults
        .map((r) => `标题: ${r.title}\n内容: ${r.content}\n来源: ${r.url}\n---`)
        .join('\n');

      const chain = prompt.pipe(this.llm).pipe(this.parser);
      const result: unknown = await chain.invoke({
        dinosaur_name: dinosaurName,
        search_results: formattedResults,
      });

      console.log(`✅ 提取图片URL完成: ${dinosaurName}`);
      // 确保返回的是字符串数组
      if (Array.isArray(result) && result.every(item => typeof item === 'string')) {
        return result.slice(0, 5);
      }
      return [];
    } catch (error) {
      console.error('提取图片URL时出错:', error);
      return [];
    }
  }

  /**
   * 验证和清理提取的信息
   */
  async validateAndCleanInfo(
    extractedInfo: any,
  ): Promise<{ isValid: boolean; errors: string[]; cleanedInfo: any }> {
    const prompt = PromptTemplate.fromTemplate(`
你是一个专业的古生物学信息验证专家。请验证以下恐龙信息的准确性和完整性。

提取的信息：
{extracted_info}

请检查以下方面并返回JSON格式的验证结果：
{{
  "isValid": true/false,
  "errors": ["错误或问题列表"],
  "cleanedInfo": {{清理后的正确信息}}
}}

验证要点（宽松模式）：
1. 至少有恐龙名称和基本分类信息
2. 学名格式尽量标准化（允许只有属名）
3. 数值信息合理性检查（允许缺失）
4. 地质时期准确性（允许缺失）
5. 其他信息可选

清理规则：
1. 标准化已有的术语和格式
2. 保留确定的信息，标记不确定信息
3. 不强制要求所有字段完整
4. 确保已有信息的一致性
5. 缺失信息设为null或合理默认值
`);

    try {
      const chain = prompt.pipe(this.llm).pipe(this.parser);
      const result: unknown = await chain.invoke({
        extracted_info: JSON.stringify(extractedInfo, null, 2),
      });

      console.log('✅ 信息验证完成');
      // 类型检查
      if (
        result &&
        typeof result === 'object' &&
        'isValid' in result &&
        'errors' in result &&
        'cleanedInfo' in result &&
        typeof result.isValid === 'boolean' &&
        Array.isArray(result.errors)
      ) {
        return {
          isValid: result.isValid,
          errors: result.errors as string[],
          cleanedInfo: result.cleanedInfo
        };
      }
      
      // 如果类型不匹配，返回默认值
      return {
        isValid: false,
        errors: ['返回结果格式不正确'],
        cleanedInfo: extractedInfo,
      };
    } catch (error) {
      console.error('验证信息时出错:', error);
      return {
        isValid: false,
        errors: ['验证过程出错'],
        cleanedInfo: extractedInfo,
      };
    }
  }
}

export default InformationExtractor;
