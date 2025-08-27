import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseServiceKey = this.configService.get<string>('supabase.serviceKey');

    this.logger.log('Supabase service key:', 'supabase.serviceKey');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and Service Key are required');
    }

    // 使用服务角色密钥创建客户端，以绕过RLS策略
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    this.logger.log('Supabase client initialized successfully with service role');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing Supabase connection...');
      const { error } = await this.supabase
        .from('dinosaurs')
        .select('count');

      if (error) {
        this.logger.error('Supabase connection test failed:', error);
        return false;
      }

      this.logger.log('Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Supabase connection test error:', error);
      return false;
    }
  }
}
