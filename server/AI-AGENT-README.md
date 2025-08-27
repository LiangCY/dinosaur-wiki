# 恐龙百科全书 AI-Agent 使用指南

## 概述

恐龙百科全书 AI-Agent 是一个智能的恐龙信息采集系统，使用 LangGraph 工作流、Tavily 搜索引擎和 OpenAI GPT 模型来自动收集、处理和存储恐龙相关信息。

## 功能特性

- 🔍 **智能搜索**: 使用 Tavily 搜索引擎从权威网站获取恐龙信息
- 🧠 **信息提取**: 使用 OpenAI GPT 模型提取结构化的恐龙数据
- 🔄 **工作流管理**: 基于 LangGraph 的智能工作流，支持错误处理和重试
- 📊 **批量处理**: 支持单个和批量恐龙信息采集
- ✅ **信息验证**: 自动验证和清理提取的信息
- 💾 **数据存储**: 自动保存到后端数据库

## 快速开始

### 1. 环境配置

复制环境变量配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入必要的 API 密钥：
```env
# AI-Agent Configuration
OPENAI_API_KEY="your_openai_api_key_here"
TAVILY_API_KEY="your_tavily_api_key_here"
```

### 2. 获取 API 密钥

#### OpenAI API Key
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账户
3. 前往 API Keys 页面
4. 创建新的 API Key

#### Tavily API Key
1. 访问 [Tavily](https://tavily.com/)
2. 注册账户
3. 获取 API Key

### 3. 启动服务

确保后端服务正在运行：
```bash
pnpm start:dev
```

## API 接口使用

### 1. 初始化 AI-Agent

**POST** `/ai-agent/initialize`

```json
{
  "openaiApiKey": "your_openai_api_key",
  "tavilyApiKey": "your_tavily_api_key",
  "backendUrl": "http://localhost:3000",
  "maxRetries": 3,
  "timeout": 60000,
  "logLevel": "info"
}
```

### 2. 测试连接

**GET** `/ai-agent/test-connections`

检查与 OpenAI、Tavily 和后端数据库的连接状态。

### 3. 研究单个恐龙

**POST** `/ai-agent/research`

```json
{
  "dinosaur_name": "霸王龙"
}
```

### 4. 批量研究恐龙

**POST** `/ai-agent/research/batch`

```json
{
  "dinosaur_names": ["霸王龙", "三角龙", "剑龙"]
}
```

### 5. 获取状态

**GET** `/ai-agent/status`

获取 AI-Agent 的当前状态和统计信息。

### 6. 获取推荐

**GET** `/ai-agent/recommendations?count=10`

获取推荐研究的恐龙列表。

## 工作流程

AI-Agent 使用以下工作流程处理恐龙信息：

1. **检查现有数据** - 验证恐龙是否已存在于数据库中
2. **搜索基本信息** - 使用 Tavily 搜索恐龙的基本信息
3. **搜索特征信息** - 搜索恐龙的物理特征和解剖结构
4. **搜索化石信息** - 搜索化石发现和考古信息
5. **提取信息** - 使用 OpenAI GPT 提取结构化数据
6. **验证信息** - 验证和清理提取的信息
7. **保存数据** - 将信息保存到数据库
8. **错误处理** - 处理错误和重试机制

## 配置选项

### AI-Agent 设置

- `maxRetries`: 最大重试次数（默认: 3）
- `timeout`: 请求超时时间（默认: 60000ms）
- `logLevel`: 日志级别（debug/info/warn/error）
- `backendUrl`: 后端 API 地址

### 搜索配置

- `TAVILY_MAX_RESULTS`: 最大搜索结果数（默认: 5）
- `TAVILY_SEARCH_DEPTH`: 搜索深度（advanced/basic）

### OpenAI 配置

- `OPENAI_MODEL`: 使用的模型（默认: gpt-4o-mini）
- `OPENAI_TEMPERATURE`: 温度参数（默认: 0.1）
- `OPENAI_MAX_TOKENS`: 最大令牌数（默认: 2000）

## 使用示例

### 使用 curl 测试

```bash
# 1. 初始化 AI-Agent
curl -X POST http://localhost:3000/ai-agent/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "openaiApiKey": "your_openai_api_key",
    "tavilyApiKey": "your_tavily_api_key"
  }'

# 2. 测试连接
curl -X GET http://localhost:3000/ai-agent/test-connections

# 3. 研究恐龙
curl -X POST http://localhost:3000/ai-agent/research \
  -H "Content-Type: application/json" \
  -d '{"dinosaur_name": "霸王龙"}'

# 4. 批量研究
curl -X POST http://localhost:3000/ai-agent/research/batch \
  -H "Content-Type: application/json" \
  -d '{"dinosaur_names": ["霸王龙", "三角龙"]}'
```

### 使用 JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:3000';

// 初始化 AI-Agent
const initResponse = await fetch(`${API_BASE}/ai-agent/initialize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    openaiApiKey: 'your_openai_api_key',
    tavilyApiKey: 'your_tavily_api_key'
  })
});

// 研究恐龙
const researchResponse = await fetch(`${API_BASE}/ai-agent/research`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dinosaur_name: '霸王龙' })
});

const result = await researchResponse.json();
console.log('研究结果:', result);
```

## 错误处理

### 常见错误

1. **401 Unauthorized**: API 密钥无效或过期
2. **400 Bad Request**: 请求参数错误
3. **500 Internal Server Error**: 服务器内部错误
4. **AI-Agent 未初始化**: 需要先调用初始化接口

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述",
  "errors": ["详细错误列表"],
  "processingTime": 1500
}
```

## 性能优化

### 批量处理

- 批量研究最多支持 10 个恐龙
- 使用并发处理，默认并发数为 3
- 批次间有 2 秒延迟，避免 API 限制

### 缓存机制

- 自动检查数据库中是否已存在恐龙信息
- 避免重复处理相同的恐龙

### 重试机制

- 支持最多 3 次重试
- 智能错误处理和恢复

## 监控和日志

### 日志级别

- `debug`: 详细的调试信息
- `info`: 一般信息（默认）
- `warn`: 警告信息
- `error`: 错误信息

### 状态监控

使用 `/ai-agent/status` 接口监控：
- AI-Agent 初始化状态
- 服务连接状态
- 处理统计信息
- 系统配置信息

## 故障排除

### 常见问题

1. **连接测试失败**
   - 检查 API 密钥是否正确
   - 确认网络连接正常
   - 验证后端服务是否运行

2. **信息提取失败**
   - 检查 OpenAI API 配额
   - 验证模型可用性
   - 调整温度和令牌参数

3. **搜索结果为空**
   - 检查 Tavily API 配额
   - 尝试不同的搜索关键词
   - 调整搜索深度设置

4. **数据保存失败**
   - 检查数据库连接
   - 验证数据格式
   - 查看后端日志

### 调试技巧

1. 设置日志级别为 `debug` 获取详细信息
2. 使用 `/ai-agent/test-connections` 检查服务状态
3. 查看控制台输出的详细错误信息
4. 检查环境变量配置

## 贡献指南

欢迎贡献代码和改进建议！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 支持

如有问题或建议，请创建 Issue 或联系开发团队。