import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context, Markup } from 'telegraf';
import { Master } from './models/master..model';
import { Client } from './models/client.model';
import { Service } from './models/service.model';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectModel(Client) private readonly clientModel: typeof Client,
    @InjectModel(Service) private readonly serviceModel: typeof Service,
  ) {}
  async start(ctx: Context) {
    await ctx.replyWithHTML(`<b>Ro'yhatdan o'tish 👇</b>`, {
      parse_mode: 'HTML',
      ...Markup.keyboard([["Ro'yhatdan o'tish 📝"]])
        .resize()
        .oneTime(),
    });
  }

  async register(ctx: Context) {
    await ctx.replyWithHTML(`<b>Kim bo'lib</b>`, {
      parse_mode: 'HTML',
      ...Markup.keyboard([['USTA', 'MIJOZ']])
        .resize()
        .oneTime(),
    });
  }

  async registerMaster(ctx: Context) {
    try {
      const masterId = ctx.from.id;
      const master = await this.masterModel.findByPk(masterId);
      if (master) {
        await ctx.replyWithHTML(
          `<b>Siz avval master sifatida ro'yhatdan o'tgansiz</b>`,
          {
            parse_mode: 'HTML',
            ...Markup.removeKeyboard(),
          },
        );
      }
      await this.masterModel.create({
        id: masterId,
        last_state: 'service_name',
      });

      const services = await this.serviceModel.findAll();
      const service_list = [];
      services.forEach(async (service) => {
        service_list.push([
          {
            text: service.service_name,
            callback_data: `service_${service.id}`,
          },
        ]);
      });

      await ctx.replyWithHTML(`<b>Servicelardan birini tanlang:</b>`, {
        reply_markup: {
          inline_keyboard: service_list,
        },
      });
    } catch (error) {
      console.log('registerMaster', error);
    }
  }

  async onClickService(ctx: Context) {
    try {
      const masterId = ctx.from.id;
      const master = await this.masterModel.findByPk(masterId);
      if (!master || master.last_state !== 'service_name') {
        await ctx.replyWithHTML(`<b>Siz avval ro'yxatdan o'tmagansiz</b>`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([['start']])
            .resize()
            .oneTime(),
        });
      }

      const serviceText = ctx.callbackQuery['data'];
      const service_id = Number(serviceText.split('_')[1]);
      const service = await this.serviceModel.findByPk(service_id);
      await master.update(
        {
          service_name: service.service_name,
          last_state: 'full_name',
        },
        { where: { id: masterId } },
      );

      await ctx.replyWithHTML(`<b>Ism va Familiyanginzni kiriting:</b>`, {
        ...Markup.removeKeyboard(),
      });
    } catch (error) {
      console.log('onClickService', error);
    }
  }

  async onText(ctx: Context) {
    try {
      if ('text' in ctx.message) {
        const masterId = ctx.from.id;
        const master = await this.masterModel.findByPk(masterId);

        if (master && master.last_state !== 'finish') {
          if (master.last_state === 'full_name') {
            await master.update(
              {
                full_name: ctx.message.text,
                last_state: 'phone_number',
              },
              { where: { id: masterId } },
            );
            await ctx.replyWithHTML(`<b>Telefon raqamingizni kiriting:</b>`, {
              parse_mode: 'HTML',
              ...Markup.keyboard([
                [
                  Markup.button.contactRequest(
                    `📞 Telefon raqamingizni yuboring`,
                  ),
                ],
              ])
                .resize()
                .oneTime(),
            });
          } else if (master.last_state === 'workshop') {
            await master.update(
              {
                workshop: ctx.message.text,
                last_state: 'address',
              },
              { where: { id: masterId } },
            );
            await ctx.replyWithHTML(`<b>Ishxona manzilini kiriting:</b>`, {
              ...Markup.removeKeyboard(),
            });
          } else if (master.last_state === 'address') {
            await master.update(
              {
                address: ctx.message.text,
                last_state: 'landmark',
              },
              { where: { id: masterId } },
            );
            await ctx.replyWithHTML(`<b>Ishxona mo'ljalini kiriting:</b>`, {
              ...Markup.removeKeyboard(),
            });
          } else if (master.last_state === 'landmark') {
            await master.update(
              {
                landmark: ctx.message.text,
                last_state: 'location',
              },
              { where: { id: masterId } },
            );
            await ctx.replyWithHTML(`<b>Ishxona lokatsiyasini kiriting:</b>`, {
              parse_mode: 'HTML',
              ...Markup.keyboard([
                [Markup.button.locationRequest(`Lokatsiyani yuborish 🎈`)],
              ]).resize(),
            });
          } else if (master.last_state === 'start_time') {
            await master.update(
              {
                start_time: ctx.message.text,
                last_state: 'end_time',
              },
              { where: { id: masterId } },
            );
            await ctx.replyWithHTML(`<b>Ish tugash vaqtini kiriting:</b>`, {
              ...Markup.removeKeyboard(),
            });
          } else if (master.last_state === 'end_time') {
            await master.update(
              {
                end_time: ctx.message.text,
                last_state: 'work_time',
              },
              { where: { id: masterId } },
            );
            await ctx.replyWithHTML(`<b>Qancha vaqt ketishini kiriting:</b>`, {
              ...Markup.removeKeyboard(),
            });
          } else if (master.last_state === 'work_time') {
            await master.update(
              {
                work_time: ctx.message.text,
                last_state: 'finish',
              },
              { where: { id: masterId } },
            );
            await ctx.replyWithHTML(
              `<b>Malumotlaringiz muvaffaqiyatli saqlandi</b>`,
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([['TASDIQLASH✅', 'BEKOR QILISH❎']])
                  .resize()
                  .oneTime(),
              },
            );
          }
        } else {
          try {
            const clientId = ctx.from.id;
            const client = await this.clientModel.findByPk(clientId);
            if (!client) {
              await ctx.reply(
                `Ro'yxatdan o'tishda muammolik, qaytadan ro'yxatdan o'ting`,
                {
                  parse_mode: 'HTML',
                  ...Markup.keyboard([['start']])
                    .resize()
                    .oneTime(),
                },
              );
            }
            if (client.last_state == 'full_name') {
              await client.update(
                {
                  name: ctx.message.text,
                  last_state: 'phone_number',
                },
                { where: { id: clientId } },
              );
              await ctx.replyWithHTML(`<b> Telefon raqamingizni kiritng:</b>`, {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  [Markup.button.contactRequest('📞 Telefon raqamni yuboring')],
                ])
                  .resize()
                  .oneTime(),
              });
            }
          } catch (error) {
            console.log('registerClient', error);
          }
        }
      }
    } catch (error) {
      console.log('onText', error);
    }
  }

  async onContact(ctx: Context) {
    try {
      if ('contact' in ctx.message) {
        const masterId = ctx.from.id;
        const master = await this.masterModel.findByPk(masterId);
        if (master && master.last_state !== 'finish') {
          if (!master) {
            await ctx.replyWithHTML(`<b>Siz avval ro'yxatdan o'tmagansiz</b>`, {
              parse_mode: 'HTML',
              ...Markup.keyboard([['start']])
                .resize()
                .oneTime(),
            });
          } else if (ctx.message.contact.user_id != masterId) {
            await ctx.replyWithHTML(
              `<b>Iltimos, o'zingizni telefon raqamingizni yuboring</b>`,
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  [Markup.button.contactRequest('📞 Telefon raqamni yuboring')],
                ])
                  .resize()
                  .oneTime(),
              },
            );
          } else {
            await this.masterModel.update(
              {
                phone_number: ctx.message.contact.phone_number,
                last_state: 'workshop',
              },
              {
                where: { id: masterId },
              },
            );
            await ctx.replyWithHTML(`<b>Ishxona nomini kiriting:</b>`, {
              ...Markup.removeKeyboard(),
            });
          }
        } else {
          const clientId = ctx.from.id;
          const client = await this.clientModel.findByPk(clientId);
          if (!client) {
            await ctx.replyWithHTML(
              `<b>Siz avval ro'yxatdan o'tmagansiz.</b>`,
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([['start']])
                  .resize()
                  .oneTime(),
              },
            );
          } else if (ctx.message.contact.user_id != clientId) {
            await ctx.replyWithHTML(
              `<b>Iltimos, o'zingizni telefon raqamingizni yuboring</b>`,
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  [Markup.button.contactRequest('📞 Telefon raqamni yuboring')],
                ])
                  .resize()
                  .oneTime(),
              },
            );
          } else {
            await this.clientModel.update(
              {
                phone_number: ctx.message.contact.phone_number,
                last_state: 'finish',
              },
              {
                where: { id: clientId },
              },
            );
            await ctx.replyWithHTML(
              `<b>Muvaffaqiyatli ro'yxatdam o'tdingiz😊</b>`,
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  ['XIZMATLAR', 'TANLANGAN XIZMATLAR'],
                  ["MA'LUMOTLARNI O'ZGARTIRISH"],
                ])
                  .resize()
                  .oneTime(),
              },
            );
          }
        }
      }
    } catch (error) {
      console.log('onContact', this.onContact);
    }
  }

  async onLocation(ctx: Context) {
    if ('location' in ctx.message) {
      const masterId = ctx.from.id;
      const master = await this.masterModel.findByPk(masterId);

      if (!master && master.last_state !== 'location') {
        await ctx.replyWithHTML(`<b>Siz avval ro'yhatdan o'tmagansiz`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([['start']])
            .resize()
            .oneTime(),
        });
      } else {
        master.location = `${ctx.message.location.latitude}, ${ctx.message.location.longitude}`;
        master.last_state = 'start_time';
        await master.save();
      }

      await ctx.replyWithHTML(`<b>Ish boshlanish vaqtini kiriting: </b>`, {
        ...Markup.removeKeyboard(),
      });
    }
  }

  async accept(ctx: Context) {
    try {
      await ctx.replyWithHTML(
        `<b>Ma'lumotaringiz muvaffaqiyatli saqlandi. Admin tasdiqlashini kuting</b>`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            ['TEKSHIRISH✅', 'BEKOR QILISH❎'],
            ["ADMIN BILAN BOG'LANISH📱"],
          ])
            .resize()
            .oneTime(),
        },
      );
    } catch (error) {
      console.log('accept', error);
    }
  }

  async cancel(ctx: Context) {
    try {
      const masterId = ctx.from.id;
      await this.masterModel.destroy({ where: { id: masterId } });
      await ctx.replyWithHTML(`<b>Ma'lumotaringiz bekor qilindi</b>`, {
        parse_mode: 'HTML',
        ...Markup.keyboard([['start']])
          .resize()
          .oneTime(),
      });
      await this.masterModel.destroy({ where: { id: masterId } });
    } catch (error) {
      console.log('cancel', error);
    }
  }

  async check(ctx: Context) {
    try {
      const masterId = ctx.from.id;
      const master = await this.masterModel.findByPk(masterId);
      await ctx.replyWithHTML(
        `<b>Ma'lumotlaringiz:</b>\n<b>Service turi:</b> ${master.service_name}\n<b>Ismi:</b> ${master.full_name}\n<b>Telefon raqami</b>:${master.phone_number}\n<b>Ishxona nomi</b>:${master.workshop}\n<b>Manzili</b>:${master.address}, ${master.landmark}\n<b>Ish vaqti</b>:${master.start_time}-${master.end_time}`,
      );
    } catch (error) {
      console.log('check', error);
    }
  }

  async connectWithAdmin(ctx: Context) {
    await ctx.reply('Xozirda adminlar bilan tuzatilish ishlari ketmoqda🛠️');
  }

  async registerClient(ctx: Context) {
    try {
      const clientId = ctx.from.id;
      const client = await this.clientModel.findByPk(clientId);
      if (client) {
        ctx.replyWithHTML(`<b>Siz avval ro'yhatdan o'tgansiz</b>`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            ['XIZMATLAR', 'TANLANGAN XIZMATLAR'],
            ["MA'LUMOTLARNI O'ZGARTIRISH"],
          ]).resize(),
        });
      }
      await this.clientModel.create({
        id: clientId,
        last_state: 'full_name',
      });
      await ctx.replyWithHTML(`<b>Ism va Familiyangizni kiriting</b>`, {
        ...Markup.removeKeyboard(),
      });
    } catch (error) {
      console.log('registerClient', error);
    }
  }
}
