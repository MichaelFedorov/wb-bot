const { Scenes : { BaseScene } } = require('telegraf');

const { isApiKeyValid } = require("../../utils/common");
const { mainKeyboard, settingsKeyboard } = require('../../utils/keyboards');
const { confirmationInlineKeyboard } = require('./helpers');

const {returnToMainScreen} = require("../../utils/common");
const { updateFieldDB } = require("../../utils/db");
const { startNotifications } = require("../../utils/notifier");
const {  } = require('./actions');

const settings = new BaseScene('settings');

settings.enter(async (ctx) => {
    try {
        //const uid = String(ctx.from.id);
        await ctx.reply('Что будем настраивать?!', settingsKeyboard);
    }
    catch(e) {
        console.error(e);
    }
});
settings.hears('⬅️ Вернуться в главное меню', async ctx => {
    ctx.session.replaceApi = false;
    return await ctx.scene.leave();
})

settings.command('start', async ctx => {
    ctx.session.replaceApi = false;
    return await ctx.scene.leave();
})

settings.hears('🔑 Заменить API Ключ', async ctx => {
    ctx.session.replaceApi = true;
    await ctx.reply('Введите новый API Ключ из личного кабинет WB', );
})

settings.on('text', async ctx => {
    // Checking if replaceAPi selected then validate the key
    if (ctx.session.replaceApi) {
        const apiKey = ctx.message.text;
        await ctx.reply('Выполняется проверка API ключа ...');
        const isApiValid = await isApiKeyValid(apiKey);
        if (isApiValid) {
            ctx.session.newApiKey = apiKey;
            ctx.session.replaceApi = false;
            await ctx.reply('Введенный ключ валиден. Заменить?', confirmationInlineKeyboard);
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
    ctx.session.user.wbApiKey = ctx.session.newApiKey;
    await updateFieldDB(ctx.session.user, 'wbApiKey', ctx.session.user.wbApiKey);
    await startNotifications(ctx);
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
    return await ctx.reply("Замена ключа отменена.");
})

settings.leave(async ctx => {
  await returnToMainScreen(ctx);
});

//addKey.enter

module.exports = settings;
