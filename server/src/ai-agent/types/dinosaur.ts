import { z } from 'zod';

// Zod schemas for validation
export const DinosaurSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  scientific_name: z.string().optional(),
  period: z.string().optional(),
  diet: z.string().optional(),
  length_min_meters: z.number().optional(),
  length_max_meters: z.number().optional(),
  weight_min_tons: z.number().optional(),
  weight_max_tons: z.number().optional(),
  habitat: z.string().optional(),
  region: z.string().optional(),
  description: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const DinosaurFossilSchema = z.object({
  id: z.number().optional(),
  dinosaur_id: z.number(),
  discovery_location: z.string(),
  discovery_date: z.string().optional(),
  fossil_type: z.string(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  created_at: z.date().optional(),
});

export const DinosaurImageSchema = z.object({
  id: z.number().optional(),
  dinosaur_id: z.number(),
  url: z.string(),
  description: z.string().optional(),
  is_primary: z.boolean().optional().default(false),
  created_at: z.date().optional(),
});

export const DinosaurDetailSchema = z.object({
  ...DinosaurSchema.shape,
  fossils: z.array(DinosaurFossilSchema).optional(),
  images: z.array(DinosaurImageSchema).optional(),
});

export const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  score: z.number().optional(),
});

// 简化的工作流状态接口
export interface WorkflowState {
  dinosaur_name: string;
  search_results: SearchResult[];
  extracted_info: any;
  fossils: any[];
  validation_result: any;
  final_result: any;
  errors: string[];
  retry_count: number;
  status: string;
  current_step?: string;
}

export const AgentStateSchema = z.object({
  dinosaur_name: z.string(),
  search_results: z.array(SearchResultSchema),
  extracted_info: z.any(),
  fossils: z.array(z.any()),
  validation_result: z.any(),
  final_result: z.any(),
  errors: z.array(z.string()),
  retry_count: z.number(),
  status: z.string(),
  current_step: z.string().optional(),
});

// TypeScript types
export type Dinosaur = z.infer<typeof DinosaurSchema>;
export type DinosaurFossil = z.infer<typeof DinosaurFossilSchema>;
export type DinosaurImage = z.infer<typeof DinosaurImageSchema>;
export type DinosaurDetail = z.infer<typeof DinosaurDetailSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type AgentState = z.infer<typeof AgentStateSchema>;

// Constants
export const DIET_TYPES = ['肉食性', '植食性', '杂食性'] as const;
export const PERIODS = [
  '三叠纪早期',
  '三叠纪中期',
  '三叠纪晚期',
  '侏罗纪早期',
  '侏罗纪中期',
  '侏罗纪晚期',
  '白垩纪早期',
  '白垩纪中期',
  '白垩纪晚期',
] as const;

export const FOSSIL_TYPES = [
  '完整骨架',
  '部分骨架',
  '头骨',
  '牙齿',
  '爪子',
  '蛋化石',
  '足迹化石',
  '皮肤印痕',
  '羽毛化石',
  '其他',
] as const;
