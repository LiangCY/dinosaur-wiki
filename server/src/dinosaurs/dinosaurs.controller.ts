import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DinosaursService } from './dinosaurs.service';
import type { Dinosaur } from './dinosaurs.service';

export interface DinosaurFossilDto {
  location: string;
  discovery_location?: string;
  discovery_date?: string;
  fossil_type: string;
  description?: string;
  image_url?: string;
}

export interface DinosaurImageDto {
  url: string;
  description?: string;
}

export interface DinosaurDto {
  name: string;
  scientific_name: string;
  era: string;
  period: string;
  start_mya: number;
  end_mya: number;
  diet: string;
  length_min_meters?: number;
  length_max_meters?: number;
  weight_min_tons?: number;
  weight_max_tons?: number;
  habitat?: string;
  region?: string;
  description?: string;
  taxonomy_kingdom?: string;
  taxonomy_phylum?: string;
  taxonomy_class?: string;
  taxonomy_order?: string;
  taxonomy_suborder?: string;
  taxonomy_family?: string;
  taxonomy_subfamily?: string;
  taxonomy_genus?: string;
  taxonomy_species?: string;
}

@Controller('api/dinosaurs')
@ApiTags('恐龙管理')
export class DinosaursController {
  constructor(private readonly dinosaursService: DinosaursService) {}

  @Get()
  @ApiOperation({ summary: '获取所有恐龙列表' })
  @ApiResponse({ status: 200, description: '成功获取恐龙列表' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'period', required: false, description: '时期筛选' })
  @ApiQuery({ name: 'diet', required: false, description: '饮食习惯筛选' })
  async getAllDinosaurs(
    @Query('search') search?: string,
    @Query('period') period?: string,
    @Query('diet') diet?: string,
  ): Promise<Dinosaur[]> {
    try {
      if (search) {
        return await this.dinosaursService.searchDinosaurs(search);
      }
      if (period) {
        return await this.dinosaursService.getDinosaursByPeriod(period);
      }
      if (diet) {
        return await this.dinosaursService.getDinosaursByDiet(diet);
      }
      return await this.dinosaursService.getAllDinosaurs();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to fetch dinosaurs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取恐龙详情' })
  @ApiResponse({ status: 200, description: '成功获取恐龙详情' })
  @ApiResponse({ status: 404, description: '恐龙未找到' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiParam({ name: 'id', description: '恐龙ID' })
  async getDinosaurById(@Param('id') id: string): Promise<Dinosaur> {
    try {
      const dinosaur = await this.dinosaursService.getDinosaurById(id);
      if (!dinosaur) {
        throw new HttpException('Dinosaur not found', HttpStatus.NOT_FOUND);
      }
      return dinosaur;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch dinosaur details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: '创建新恐龙' })
  @ApiResponse({ status: 201, description: '成功创建恐龙' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiBody({ description: '恐龙数据' })
  async createDinosaur(
    @Body() dinosaurData: Omit<Dinosaur, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Dinosaur> {
    try {
      return await this.dinosaursService.createDinosaur(dinosaurData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to create dinosaur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: '更新恐龙信息' })
  @ApiResponse({ status: 200, description: '成功更新恐龙信息' })
  @ApiResponse({ status: 404, description: '恐龙未找到' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiParam({ name: 'id', description: '恐龙ID' })
  @ApiBody({ description: '恐龙数据' })
  async updateDinosaur(
    @Param('id') id: string,
    @Body()
    dinosaurData: Partial<Omit<Dinosaur, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Dinosaur> {
    try {
      return await this.dinosaursService.updateDinosaur(id, dinosaurData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to update dinosaur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/fossils')
  @ApiOperation({ summary: '为恐龙添加化石记录' })
  @ApiResponse({ status: 200, description: '成功添加化石记录' })
  @ApiResponse({ status: 404, description: '恐龙未找到' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiParam({ name: 'id', description: '恐龙ID' })
  @ApiBody({ description: '化石数据', isArray: true })
  async addFossils(
    @Param('id') id: string,
    @Body() body: { fossils: DinosaurFossilDto[] },
  ): Promise<void> {
    try {
      await this.dinosaursService.addFossils(id, body.fossils);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to add fossils',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/images')
  @ApiOperation({ summary: '为恐龙添加图片' })
  @ApiResponse({ status: 200, description: '成功添加图片' })
  @ApiResponse({ status: 404, description: '恐龙未找到' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiParam({ name: 'id', description: '恐龙ID' })
  @ApiBody({ description: '图片数据', isArray: true })
  async addImages(
    @Param('id') id: string,
    @Body() body: { images: DinosaurImageDto[] },
  ): Promise<void> {
    try {
      await this.dinosaursService.addImages(id, body.images);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to add images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除恐龙' })
  @ApiResponse({ status: 200, description: '成功删除恐龙' })
  @ApiResponse({ status: 404, description: '恐龙未找到' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiParam({ name: 'id', description: '恐龙ID' })
  async deleteDinosaur(@Param('id') id: string): Promise<void> {
    try {
      await this.dinosaursService.deleteDinosaur(id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to delete dinosaur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/images')
  @ApiOperation({ summary: '获取恐龙图片列表' })
  @ApiResponse({ status: 200, description: '成功获取图片列表' })
  @ApiResponse({ status: 404, description: '恐龙未找到' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiParam({ name: 'id', description: '恐龙ID' })
  async getImagesByDinosaurId(
    @Param('id') id: string,
  ): Promise<{ url: string; description?: string }[]> {
    try {
      return await this.dinosaursService.getImagesByDinosaurId(id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to fetch dinosaur images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id/images')
  @ApiOperation({ summary: '删除恐龙图片' })
  @ApiResponse({ status: 200, description: '成功删除图片' })
  @ApiResponse({ status: 404, description: '恐龙未找到' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiParam({ name: 'id', description: '恐龙ID' })
  @ApiBody({ description: '图片URL' })
  async deleteImageByUrl(
    @Param('id') id: string,
    @Body() body: { url: string },
  ): Promise<void> {
    try {
      await this.dinosaursService.deleteImageByUrl(id, body.url);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to delete dinosaur image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
