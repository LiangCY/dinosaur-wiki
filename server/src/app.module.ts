import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DinosaursModule } from './dinosaurs/dinosaurs.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';

@Module({
  imports: [DinosaursModule, AiAgentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
