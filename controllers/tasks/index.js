const { Telegraf, Scenes : { Stage, BaseScene } } = require('telegraf');
//const { validateEmail } = require('./helpers');
const axios = require('axios');

const { ordersUrl } = require('../../config');

const { mainKeyboard, tasksKeyboard } = require('../../util/keyboards');

const { leave } = Stage;

const tasks = new BaseScene('tasks');

tasks.enter(async (ctx) => {
    try{
        const uid = String(ctx.from.id);
    //   const user = await User.findById(uid);
    //   const { mainKeyboard } = getMainKeyboard(ctx);

    //   if (user) {
    //     await ctx.reply(ctx.i18n.t('scenes.start.welcome_back'), mainKeyboard);
    //   } else {
    //     logger.debug(ctx, 'New user has been created');
    //     const now = new Date().getTime();

    //     const newUser = new User({
    //       _id: uid,
    //       created: now,
    //       username: ctx.from.username,
    //       name: ctx.from.first_name + ' ' + ctx.from.last_name,
    //       observableMovies: [],
    //       lastActivity: now,
    //       totalMovies: 0,
    //       language: 'en'
    //     });

    //     await newUser.save();
        await ctx.reply('Выберите тип заданиий', tasksKeyboard);
    }
    catch{
        console.error()
    }
//   }
});
tasks.hears('⬅️ Назад', ctx => ctx.scene.leave())

tasks.leave(async ctx => {
  await ctx.reply('Чем могу помочь?', mainKeyboard);
});

// start.command('saveme', leave());
// start.action(/languageChange/, languageChangeAction);
// start.action(/confirmAccount/, async (ctx: ContextMessageUpdate) => {
//   await ctx.answerCbQuery();
//   ctx.scene.leave();
// });

module.exports = tasks;
