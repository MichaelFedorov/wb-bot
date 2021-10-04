const { Telegraf, Scenes : { Stage, BaseScene } } = require('telegraf');
//const { validateEmail } = require('./helpers');

const { ordersUrl } = require('../../config');

const { mainKeyboard, tasksKeyboard } = require('../../util/keyboards');
const { 
    newTasksInlineKeyboard, 
    next15TasksInlineKeyboard, 
    closeAllInlineKeyboard,
    prev15TasksInlineKeyboard 
} = require('./helpers');
const { getTasks, getTasksMsg } = require('./actions');

const { leave } = Stage;

const tasks = new BaseScene('tasks');

tasks.enter(async (ctx) => {
    try {
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
    catch {
        console.error()
    }
//   }
});


tasks.hears('🆕 Новые', async ctx => {
    await getTasks(ctx, 0);
    ctx.session.tasks = ctx.session.newTasks;
    ctx.session.taskPage = 0;
    ctx.session.firstTask = 0;
    ctx.session.lastTask = ctx.session.tasks?.length;
    let msg;
    if (ctx.session.tasks.length > 15) {
        ctx.session.lastTask = 15;
        msg = await getTasksMsg(ctx);
        return await ctx.replyWithHTML(msg, next15TasksInlineKeyboard);
    }
    msg = await getTasksMsg(ctx, true);
    return await ctx.replyWithHTML(msg, closeAllInlineKeyboard);
})

tasks.hears('⚒ На сборке', async ctx => {
    await getTasks(ctx, 1);
    ctx.session.tasks = ctx.session.onAssemblyTasks;
    ctx.session.taskPage = 0;
    ctx.session.firstTask = 0;
    ctx.session.lastTask = ctx.session.tasks?.length;
    let msg;
    if (ctx.session.tasks.length > 15) {
        ctx.session.lastTask = 15;
        msg = await getTasksMsg(ctx);
        return await ctx.replyWithHTML(msg, next15TasksInlineKeyboard);
    }
    msg = await getTasksMsg(ctx, true);
    return await ctx.replyWithHTML(msg, closeAllInlineKeyboard);
})

tasks.hears('Собранные', async ctx => {
    await getTasks(ctx, 2);
    ctx.session.tasks = ctx.session.readyTasks;
    ctx.session.taskPage = 0;
    ctx.session.firstTask = 0;
    ctx.session.lastTask = ctx.session.tasks?.length;
    let msg;
    if (ctx.session.tasks.length > 15) {
        ctx.session.lastTask = 15;
        msg = await getTasksMsg(ctx);
        return await ctx.replyWithHTML(msg, next15TasksInlineKeyboard);
    }
    msg = await getTasksMsg(ctx, true);
    return await ctx.replyWithHTML(msg, closeAllInlineKeyboard);
})

tasks.hears('⬅️ Назад', ctx => ctx.scene.leave())

tasks.action('next15', async ctx =>{
    await ctx.answerCbQuery();
    ctx.deleteMessage();
    ctx.session.firstTask = ctx.session.lastTask;
    ctx.session.taskPage += 1;
    console.log(ctx.session.taskPage)
    if (ctx.session.taskPage !== Math.floor(ctx.session.tasks.length / 15)) {
        ctx.session.lastTask = ctx.session.firstTask + 15;
        const msg = await getTasksMsg(ctx, true);
        return await ctx.replyWithHTML(msg, next15TasksInlineKeyboard);
    } else {
        ctx.session.lastTask = ctx.session.tasks.length;
        const msg = await getTasksMsg(ctx, true);
        return await ctx.replyWithHTML(msg, closeAllInlineKeyboard);
    }
})

// tasks.action('prev', async ctx =>{
//     await ctx.answerCbQuery();
//     ctx.deleteMessage();
//     ctx.session.firstTask = ctx.session.lastTask;
//     ctx.session.taskPage += 1;
//     console.log(ctx.session.taskPage)
//     if (ctx.session.taskPage !== Math.floor(ctx.session.tasks.length / 15)) {
//         ctx.session.lastTask = ctx.session.firstTask + 15;
//         const msg = await getTasksMsg(ctx, true);
//         return await ctx.replyWithHTML(msg, next15TasksInlineKeyboard);
//     } else {
//         ctx.session.lastTask = ctx.session.tasks.length;
//         const msg = await getTasksMsg(ctx, true);
//         return await ctx.replyWithHTML(msg, prev15TasksInlineKeyboard);
//     }
// })

tasks.action('closeAllTasks', async ctx =>{
    await ctx.answerCbQuery();
    console.log('addds')
    return await ctx.deleteMessage();
})

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
