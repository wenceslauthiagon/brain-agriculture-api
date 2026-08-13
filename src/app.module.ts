import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducersModule } from './modules/producers/producers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [ProducersModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
