import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import supabaseConfig from '../config/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [supabaseConfig],
    }),
  ],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
