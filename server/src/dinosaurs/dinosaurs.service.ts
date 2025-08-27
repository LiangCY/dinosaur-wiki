import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Dinosaur {
  id: string;
  name: string;
  scientific_name: string;
  period: string;
  diet: string;
  length_min_meters?: number;
  length_max_meters?: number;
  weight_min_tons?: number;
  weight_max_tons?: number;
  habitat?: string;
  region?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DinosaurFossil {
  id: string;
  dinosaur_id: string;
  location: string;
  discovery_date?: string;
  description?: string;
  created_at?: string;
}

@Injectable()
export class DinosaursService {
  private readonly logger = new Logger(DinosaursService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllDinosaurs(): Promise<
    (Dinosaur & { images: { url: string; description?: string }[] })[]
  > {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      // 获取所有恐龙基本信息
      const dinosaursResult = await supabase
        .from('dinosaurs')
        .select('*')
        .order('name', { ascending: true });

      if (dinosaursResult.error) {
        this.logger.error(
          `Failed to fetch dinosaurs: ${dinosaursResult.error.message}`,
        );
        throw new Error(
          `Failed to fetch dinosaurs: ${dinosaursResult.error.message}`,
        );
      }

      const dinosaurs = dinosaursResult.data || [];

      // 如果没有恐龙数据，直接返回空数组
      if (dinosaurs.length === 0) {
        return [];
      }

      // 获取所有恐龙的图片信息（单次查询）
      const dinosaurIds = dinosaurs.map((dinosaur) => dinosaur.id);
      const imagesResult = await supabase
        .from('dinosaur_images')
        .select('dinosaur_id, url, description')
        .in('dinosaur_id', dinosaurIds);

      if (imagesResult.error) {
        this.logger.error(
          `Failed to fetch dinosaur images: ${imagesResult.error.message}`,
        );
        // 即使图片获取失败，也返回恐龙信息，只是图片数组为空
        return dinosaurs.map((dinosaur) => ({ ...dinosaur, images: [] }));
      }

      // 在内存中关联恐龙和图片数据
      const imagesMap = new Map<
        string,
        { url: string; description?: string }[]
      >();

      // 初始化每个恐龙的图片数组
      dinosaurs.forEach((dinosaur) => {
        imagesMap.set(dinosaur.id, []);
      });

      // 将图片数据按恐龙ID分组
      (imagesResult.data || []).forEach((image) => {
        const currentImages = imagesMap.get(image.dinosaur_id) || [];
        imagesMap.set(image.dinosaur_id, [
          ...currentImages,
          { url: image.url, description: image.description },
        ]);
      });

      // 合并恐龙信息和图片信息
      const dinosaursWithImages = dinosaurs.map((dinosaur) => ({
        ...dinosaur,
        images: imagesMap.get(dinosaur.id) || [],
      }));

      return dinosaursWithImages;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch dinosaurs: ${errorMessage}`);
      throw new Error(`Failed to fetch dinosaurs: ${errorMessage}`);
    }
  }

  async getDinosaurById(id: string): Promise<
    | (Dinosaur & {
        fossils: DinosaurFossil[];
        images: { url: string; description?: string }[];
      })
    | null
  > {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      // Get dinosaur basic info
      const dinosaurResult = await supabase
        .from('dinosaurs')
        .select('*')
        .eq('id', id)
        .single();

      if (dinosaurResult.error || !dinosaurResult.data) {
        return null;
      }

      // Get fossils
      const fossilsResult = await supabase
        .from('dinosaur_fossils')
        .select('*')
        .eq('dinosaur_id', id);

      if (fossilsResult.error) {
        const errorMessage = fossilsResult.error.message || 'Unknown error';
        this.logger.error(`Failed to fetch dinosaur details: ${errorMessage}`);
        throw new Error(`Failed to fetch dinosaur details: ${errorMessage}`);
      }

      // Get images
      const imagesResult = await supabase
        .from('dinosaur_images')
        .select('url, description')
        .eq('dinosaur_id', id);

      if (imagesResult.error) {
        const errorMessage = imagesResult.error.message || 'Unknown error';
        this.logger.error(`Failed to fetch dinosaur images: ${errorMessage}`);
        throw new Error(`Failed to fetch dinosaur images: ${errorMessage}`);
      }

      return {
        ...(dinosaurResult.data as Dinosaur),
        fossils: (fossilsResult.data as DinosaurFossil[]) || [],
        images:
          (imagesResult.data as { url: string; description?: string }[]) || [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch dinosaur by ID: ${errorMessage}`);
      throw new Error(`Failed to fetch dinosaur by ID: ${errorMessage}`);
    }
  }

  async searchDinosaurs(query: string): Promise<Dinosaur[]> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const result = await supabase
        .from('dinosaurs')
        .select('*')
        .or(
          `name.ilike.%${query}%,scientific_name.ilike.%${query}%,description.ilike.%${query}%`,
        );

      if (result.error) {
        this.logger.error(
          `Failed to search dinosaurs: ${result.error.message}`,
        );
        throw new Error(`Failed to search dinosaurs: ${result.error.message}`);
      }

      return result.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to search dinosaurs: ${errorMessage}`);
      throw new Error(`Failed to search dinosaurs: ${errorMessage}`);
    }
  }

  async getDinosaursByPeriod(period: string): Promise<Dinosaur[]> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const result = await supabase
        .from('dinosaurs')
        .select('*')
        .eq('period', period);

      if (result.error) {
        this.logger.error(
          `Failed to fetch dinosaurs by period: ${result.error.message}`,
        );
        throw new Error(
          `Failed to fetch dinosaurs by period: ${result.error.message}`,
        );
      }

      return result.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch dinosaurs by period: ${errorMessage}`);
      throw new Error(`Failed to fetch dinosaurs by period: ${errorMessage}`);
    }
  }

  async getDinosaursByDiet(diet: string): Promise<Dinosaur[]> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const result = await supabase
        .from('dinosaurs')
        .select('*')
        .eq('diet', diet);

      if (result.error) {
        this.logger.error(
          `Failed to fetch dinosaurs by diet: ${result.error.message}`,
        );
        throw new Error(
          `Failed to fetch dinosaurs by diet: ${result.error.message}`,
        );
      }

      return result.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch dinosaurs by diet: ${errorMessage}`);
      throw new Error(`Failed to fetch dinosaurs by diet: ${errorMessage}`);
    }
  }

  async createDinosaur(
    dinosaurData: Omit<Dinosaur, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Dinosaur> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const result = await supabase
        .from('dinosaurs')
        .insert({
          name: dinosaurData.name,
          scientific_name: dinosaurData.scientific_name,
          period: dinosaurData.period,
          diet: dinosaurData.diet,
          length_min_meters: dinosaurData.length_min_meters,
          length_max_meters: dinosaurData.length_max_meters,
          weight_min_tons: dinosaurData.weight_min_tons,
          weight_max_tons: dinosaurData.weight_max_tons,
          habitat: dinosaurData.habitat,
          region: dinosaurData.region,
          description: dinosaurData.description,
        })
        .select()
        .single();

      if (result.error) {
        this.logger.error(`Failed to create dinosaur: ${result.error.message}`);
        throw new Error(`Failed to create dinosaur: ${result.error.message}`);
      }

      return result.data as Dinosaur;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create dinosaur: ${errorMessage}`);
      throw new Error(`Failed to create dinosaur: ${errorMessage}`);
    }
  }

  async updateDinosaur(
    id: string,
    dinosaurData: Partial<Omit<Dinosaur, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Dinosaur> {
    try {
      this.logger.log(
        `Updating dinosaur ${id} with data:`,
        JSON.stringify(dinosaurData),
      );
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const result = await supabase
        .from('dinosaurs')
        .update(dinosaurData)
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        this.logger.error(`Failed to update dinosaur: ${result.error.message}`);
        throw new Error(`Failed to update dinosaur: ${result.error.message}`);
      }

      if (!result.data) {
        throw new Error('Dinosaur not found');
      }

      return result.data as Dinosaur;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update dinosaur ${id}: ${errorMessage}`);
      throw new Error(`Failed to update dinosaur ${id}: ${errorMessage}`);
    }
  }

  async addFossils(
    dinosaurId: string,
    fossils: Omit<DinosaurFossil, 'id' | 'dinosaur_id'>[],
  ): Promise<DinosaurFossil[]> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const fossilsWithDinosaurId = fossils.map((fossil) => ({
        ...fossil,
        dinosaur_id: dinosaurId,
      }));

      const result = await supabase
        .from('dinosaur_fossils')
        .insert(fossilsWithDinosaurId)
        .select();

      if (result.error) {
        this.logger.error(`Failed to add fossils: ${result.error.message}`);
        throw new Error(`Failed to add fossils: ${result.error.message}`);
      }

      return result.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to add fossils: ${errorMessage}`);
      throw new Error(`Failed to add fossils: ${errorMessage}`);
    }
  }

  async addImages(
    dinosaurId: string,
    images: { url: string; description?: string }[],
  ): Promise<void> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const imagesWithDinosaurId = images.map((image) => ({
        ...image,
        dinosaur_id: dinosaurId,
      }));

      const result = await supabase
        .from('dinosaur_images')
        .insert(imagesWithDinosaurId);

      if (result.error) {
        this.logger.error(`Failed to add images: ${result.error.message}`);
        throw new Error(`Failed to add images: ${result.error.message}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to add images: ${errorMessage}`);
      throw new Error(`Failed to add images: ${errorMessage}`);
    }
  }

  async getImagesByDinosaurId(
    dinosaurId: string,
  ): Promise<{ url: string; description?: string }[]> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const result = await supabase
        .from('dinosaur_images')
        .select('url, description')
        .eq('dinosaur_id', dinosaurId);

      if (result.error) {
        this.logger.error(
          `Failed to fetch dinosaur images: ${result.error.message}`,
        );
        throw new Error(
          `Failed to fetch dinosaur images: ${result.error.message}`,
        );
      }

      return result.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch dinosaur images: ${errorMessage}`);
      throw new Error(`Failed to fetch dinosaur images: ${errorMessage}`);
    }
  }

  async deleteImageByUrl(dinosaurId: string, imageUrl: string): Promise<void> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      const result = await supabase
        .from('dinosaur_images')
        .delete()
        .eq('dinosaur_id', dinosaurId)
        .eq('url', imageUrl);

      if (result.error) {
        this.logger.error(
          `Failed to delete dinosaur image: ${result.error.message}`,
        );
        throw new Error(
          `Failed to delete dinosaur image: ${result.error.message}`,
        );
      }

      // 检查是否真的删除了记录
      if (result.count === 0) {
        throw new Error('Image not found');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete dinosaur image: ${errorMessage}`);
      throw new Error(`Failed to delete dinosaur image: ${errorMessage}`);
    }
  }

  async deleteDinosaur(id: string): Promise<void> {
    try {
      const supabase: SupabaseClient = this.supabaseService.getClient();

      // 删除相关的化石记录
      const fossilsResult = await supabase
        .from('dinosaur_fossils')
        .delete()
        .eq('dinosaur_id', id);

      if (fossilsResult.error) {
        this.logger.error(
          `Failed to delete dinosaur fossils: ${fossilsResult.error.message}`,
        );
        throw new Error(
          `Failed to delete dinosaur fossils: ${fossilsResult.error.message}`,
        );
      }

      // 删除相关的图片记录
      const imagesResult = await supabase
        .from('dinosaur_images')
        .delete()
        .eq('dinosaur_id', id);

      if (imagesResult.error) {
        this.logger.error(
          `Failed to delete dinosaur images: ${imagesResult.error.message}`,
        );
        throw new Error(
          `Failed to delete dinosaur images: ${imagesResult.error.message}`,
        );
      }

      // 删除恐龙记录
      const dinosaurResult = await supabase
        .from('dinosaurs')
        .delete()
        .eq('id', id);

      if (dinosaurResult.error) {
        this.logger.error(
          `Failed to delete dinosaur: ${dinosaurResult.error.message}`,
        );
        throw new Error(
          `Failed to delete dinosaur: ${dinosaurResult.error.message}`,
        );
      }

      // 检查是否真的删除了记录
      if (dinosaurResult.count === 0) {
        throw new Error('Dinosaur not found');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete dinosaur ${id}: ${errorMessage}`);
      throw new Error(`Failed to delete dinosaur ${id}: ${errorMessage}`);
    }
  }
}

export interface DinosaurWithDetails extends Dinosaur {
  fossils: DinosaurFossil[];
}
