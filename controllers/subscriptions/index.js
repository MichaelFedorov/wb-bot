const { Scenes : { BaseScene } } = require('telegraf');
const { subscriptionsOnKeyboard, subscriptionsOffKeyboard } = require('../../utils/keyboards');
const { returnToMainScreen } = require('../../utils/common');
const {  } = require('./actions');

const subscribe = new BaseScene('subscribe');

subscribe.enter(async (ctx) => {
    const isSubscribedUser = ctx.session?.user?.subscribeValid > new Date().toISOString()
    try {
        await ctx.reply('Подписка',  isSubscribedUser ? subscriptionsOnKeyboard : subscriptionsOffKeyboard);
    }
    catch(e) {
        console.error(e);
    }
});

subscribe.hears('⬅️ Вернуться', ctx => {
    ctx.scene.leave()
})
subscribe.hears('Проверить дату окончания подписки', async ctx => {
    await ctx.reply(`Подписка действует до ${ctx.session?.user?.subscribeValid}`, );
})

subscribe.on('text', async ctx => {

})

subscribe.hears('Оформить подписку', async ctx =>{
  return await ctx.reply('Подписка успешно оформлена');
})

subscribe.hears('Отменить подписку', async ctx =>{
    return await ctx.reply('Подписка успешно отменена');
})

subscribe.hears('Условия подписки', async ctx =>{
  return await ctx.reply('Условия подписки');
})

subscribe.leave(async ctx => {
  await returnToMainScreen(ctx);
});

//addKey.enter

module.exports = subscribe;
