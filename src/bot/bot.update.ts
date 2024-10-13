import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Hears('start')
  async start(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Hears("Ro'yhatdan o'tish 📝")
  async register(@Ctx() ctx: Context) {
    await this.botService.register(ctx);
  }

  @Hears('USTA')
  async registerMaster(@Ctx() ctx: Context) {
    await this.botService.registerMaster(ctx);
  }

  @Action(/service_+\d/)
  async onClickService(@Ctx() ctx: Context) {
    await this.botService.onClickService(ctx);
  }

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @On('location')
  async onLocation(@Ctx() ctx: Context) {
    await this.botService.onLocation(ctx);
  }

  @Hears('TASDIQLASH✅')
  async accept(@Ctx() ctx: Context) {
    await this.botService.accept(ctx);
  }

  @Hears('BEKOR QILISH❎')
  async cancel(@Ctx() ctx: Context) {
    await this.botService.cancel(ctx);
  }

  @Hears("ADMIN BILAN BOG'LANISH📱")
  async connectWithAdmin(@Ctx() ctx: Context) {
    await this.botService.connectWithAdmin(ctx);
  }

  @Hears('TEKSHIRISH✅')
  async check(@Ctx() ctx: Context) {
    await this.botService.check(ctx);
  }

  @Hears('MIJOZ')
  async registerClient(@Ctx() ctx: Context) {
    await this.botService.registerClient(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }
}
