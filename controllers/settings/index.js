const { Telegraf, Scenes : { Stage, BaseScene }, Composer } = require('telegraf');
const axios = require('axios');

const { ordersUrl } = require('../../config');

const { mainKeyboard, settingsKeyboard } = require('../../util/keyboards');
const {
    confirmationInlineKeyboard,
} = require('./helpers');
const {  } = require('./actions');

const settings = new BaseScene('settings');

settings.enter(async (ctx) => {
    try {
        const uid = String(ctx.from.id);
        await ctx.reply('Что будем настривать?!', settingsKeyboard);
    }
    catch(e) {
        console.error(e);
    }
});
settings.hears('⬅️ Вернуться', ctx => {
    ctx.session.replaceApi = false;
    ctx.scene.leave()
})
settings.hears('🔑 Заменить API Ключ', async ctx => {
    ctx.session.replaceApi = true;
    await ctx.reply('Введите новый API Ключ из личного кабинет WB', );
})

settings.on('text', async ctx => {
    // Checking if replaceAPi selected then validate the key
    if (ctx.session.replaceApi) {
        let isApiValid = false;
            const date = new Date().toISOString();
            const apiKey = ctx.message.text;
            
            await ctx.reply('Выполняется проверка API ключа ...');
            await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
                headers: {
                    authorization: apiKey,
                } 
            })
            .then((response) => {
                isApiValid = true;
            })
            .catch((e) => {
                console.log(e)
                isApiValid = false;
            })

            if (isApiValid) {
                ctx.session.newApiKey = apiKey;
                ctx.session.replaceApi = false;
                await ctx.reply('Введный ключ валиден. Заменить?', confirmationInlineKeyboard);
            } else {
                await ctx.replyWithHTML(`❗️ <b>Введеный вами API ключ невалиден.</b>
    Проверьте, пожалуйста, и введите снова.
    Если ошибка повторяется, попробуйте создать новый ключ для работы с ботом или свяжитесь с нами.`);
            }
    }
})


settings.action('confirm', async ctx =>{
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    ctx.session.apiKey = ctx.session.newApiKey;
    ctx.session.replaceApi = false;
    ctx.session.newApiKey = '';
    // TODO restart notification with new key
    return await ctx.reply("Ключ успешно изменен!");
})

settings.action('cancel', async ctx =>{
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    ctx.session.replaceApi = false;
    ctx.session.newApiKey = '';
    return await ctx.reply("Замена ключа отмена.");
})

settings.leave(async ctx => {
  await ctx.reply('Чем могу помочь?', mainKeyboard);
});

//addKey.enter

module.exports = settings;