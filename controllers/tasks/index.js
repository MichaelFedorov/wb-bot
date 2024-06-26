const { Scenes : { Stage, BaseScene } } = require('telegraf');

const { tasksKeyboard } = require('../../utils/keyboards');
const {
    showTasks,
    next15TasksInlineKeyboard,
    prev15TasksInlineKeyboard,
    prevNext15TasksInlineKeyboard
} = require('./helpers');
const { getTasks, getTasksMsg, getStickersPdf } = require('./actions');
const { sleep } = require("../../utils/common");

const tasks = new BaseScene('tasks');

tasks.enter(async (ctx) => {
    try {
        ctx.reply('Выберите из списка тип заданий, по которому нужна информация.', tasksKeyboard);
        await sleep(0.5);
        return await ctx.reply('Задания отображаются за последние 120 часов');
    }
    catch(e) {
        console.error(e)
    }
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

tasks.action('downloadStickers', async ctx =>{
    await ctx.answerCbQuery();
    getStickersPdf(ctx);
})

tasks.action('closeAllTasks', async ctx =>{
    await ctx.answerCbQuery();
    return await ctx.deleteMessage();
})

module.exports = tasks;
