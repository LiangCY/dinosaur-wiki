import { Module } from '@nestjs/common';
import { DinosaursController } from './dinosaurs.controller';
import { DinosaursService } from './dinosaurs.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DinosaursController],
  providers: [DinosaursService],
})
export class DinosaursModule {}