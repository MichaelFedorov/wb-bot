const { Telegraf, Scenes : { Stage, BaseScene }, Composer } = require('telegraf');
const axios = require('axios');

const { ordersUrl } = require('../../config');

const { salesKeyboard } = require('../../utils/keyboards');
const {
    confirmationInlineKeyboard,
} = require('./helpers');
const {returnToMainScreen} = require("../../utils/common");
const {  } = require('./actions');

const sales = new BaseScene('sales');

sales.enter(async (ctx) => {
    try {
      await ctx.reply('Выберите тип продаж', salesKeyboard);
    }
    catch(e) {
        console.error(e);
    }
});
sales.hears('⬅️ Вернуться', ctx => {
    ctx.session.replaceApi = false;
    ctx.scene.leave()
})
sales.hears('Продажи за сегодня', async ctx => {
  // TODO: API request and response needed
    await ctx.reply('Продажи за сегодня', );
})

sales.on('text', async ctx => {
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


sales.action('confirm', async ctx =>{
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    ctx.session.user.wbApiKey = ctx.session?.newApiKey;
    ctx.session.replaceApi = false;
    ctx.session.newApiKey = '';
    // TODO restart notification with new key
    return await ctx.reply("Ключ успешно изменен!");
})

sales.action('cancel', async ctx =>{
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    ctx.session.replaceApi = false;
    ctx.session.newApiKey = '';
    return await ctx.reply("Замена ключа отмена.");
})

sales.leave(async ctx => {
  await returnToMainScreen(ctx)
});

//addKey.enter

module.exports = sales;
