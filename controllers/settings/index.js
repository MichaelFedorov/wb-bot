const { Telegraf, Scenes : { Stage, BaseScene } } = require('telegraf');
//const { validateEmail } = require('./helpers');

const { ordersUrl } = require('../../config');

const { mainKeyboard, settingsKeyboard } = require('../../util/keyboards');
const {
    apiInlineKeyboard,
    addApiKeyInlineKeyboard
} = require('./helpers');
const {  } = require('./actions');

const { leave } = Stage;

const settings = new BaseScene('settings');

settings.enter(async (ctx) => {
    try {
        const uid = String(ctx.from.id);
        await ctx.reply('Что будем настривать?!', settingsKeyboard);
    }
    catch(e) {
        console.error(e)
    }
//   }
});

settings.hears('🔑 API Ключ', async ctx => {
    if (ctx.session.apiKey) {
        return await ctx.reply('Выберите действие', apiInlineKeyboard);
    }
    return await ctx.reply('У нас нет добавленного ключа', addApiKeyInlineKeyboard);
})
// settings.hears('🔑 API Ключ', async ctx => {
//     return await ctx.editMessageText(msg, {
//         parse_mode: 'HTML',
//         ...prevNext15TasksInlineKeyboard
//     });
// })

settings.hears('⬅️ Вернуться', ctx => ctx.scene.leave())
settings.action('addKey', async ctx =>{
    await ctx.answerCbQuery();
    return await ctx.deleteMessage();
})
settings.action('closeAllTasks', async ctx =>{
    await ctx.answerCbQuery();
    return await ctx.deleteMessage();
})
settings.leave(async ctx => {
  await ctx.reply('Чем могу помочь?', mainKeyboard);
});

addKey.enter

module.exports = settings;
