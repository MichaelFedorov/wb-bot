const { Scenes : { Stage, BaseScene } } = require('telegraf');

const { tasksKeyboard } = require('../../utils/keyboards');
const {
    showTasks,
    next15TasksInlineKeyboard,
    prev15TasksInlineKeyboard,
    prevNext15TasksInlineKeyboard
} = require('./helpers');
const { getTasks, getTasksMsg } = require('./actions');
const {returnToMainScreen} = require("../../utils/common");

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


tasks.hears('✳️ Новые', async ctx => {
    await getTasks(ctx, 0);
    ctx.session.tasks = ctx.session.newTasks;
    showTasks(ctx);
})

tasks.hears('⚒ На сборке', async ctx => {
    await getTasks(ctx, 1);
    ctx.session.tasks = ctx.session.onAssemblyTasks;
    showTasks(ctx);
})

tasks.hears('🚚 Собранные', async ctx => {
    await getTasks(ctx, 2);
    ctx.session.tasks = ctx.session.readyTasks;
    showTasks(ctx);
})

tasks.hears('⬅️ Вернуться', ctx => ctx.scene.leave())

tasks.action('next15', async ctx =>{
    await ctx.answerCbQuery();
    ctx.session.firstTask = ctx.session.lastTask;
    ctx.session.taskPage += 1;

    if (ctx.session.taskPage !== Math.floor(ctx.session.tasks.length / 15)) {
        ctx.session.lastTask = ctx.session.firstTask + 15;
        const msg = await getTasksMsg(ctx, true);
        return await ctx.editMessageText(msg, {
            parse_mode: 'HTML',
            ...prevNext15TasksInlineKeyboard
        });
    } else {
        ctx.session.lastTask = ctx.session.tasks.length;
        const msg = await getTasksMsg(ctx, true);
        return await ctx.editMessageText(msg, {
            parse_mode: 'HTML',
            ...prev15TasksInlineKeyboard
        });
    }
})

tasks.action('prev15', async ctx =>{
    await ctx.answerCbQuery();
    ctx.session.lastTask = ctx.session.firstTask;
    ctx.session.taskPage -= 1;

    if (ctx.session.taskPage !== 0) {
        ctx.session.firstTask = ctx.session.lastTask - 15;
        const msg = await getTasksMsg(ctx, true);
        return await ctx.editMessageText(msg, {
            parse_mode: 'HTML',
            ...prevNext15TasksInlineKeyboard
        });
    } else {
        ctx.session.firstTask = 0;
        const msg = await getTasksMsg(ctx, true);
        return await ctx.editMessageText(msg, {
            parse_mode: 'HTML',
            ...next15TasksInlineKeyboard
        });
    }
})

tasks.action('closeAllTasks', async ctx =>{
    await ctx.answerCbQuery();
    return await ctx.deleteMessage();
})

tasks.leave(async ctx => {
  await returnToMainScreen(ctx);
});

module.exports = tasks;
