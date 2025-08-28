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

@Controller('api/dinosaurs')
export class DinosaursController {
  constructor(private readonly dinosaursService: DinosaursService) {}

  @Get()
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
