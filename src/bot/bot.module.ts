import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { Master } from './models/master..model';
import { Client } from './models/client.model';
import { Service } from './models/service.model';

@Module({
  imports: [SequelizeModule.forFeature([Bot, Master, Client, Service])],
  controllers: [],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
