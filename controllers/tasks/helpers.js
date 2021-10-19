const { Markup } = require('telegraf');
const { getTasksMsg } = require('./actions');

const showTasks = async ctx => {
    ctx.session.taskPage = 0;
    ctx.session.firstTask = 0;
    ctx.session.lastTask = ctx.session?.tasks?.length;
    let msg;
    if (ctx.session?.tasks?.length > 15) {
        ctx.session.lastTask = 15;
        msg = await getTasksMsg(ctx);
        return await ctx.replyWithHTML(msg, next15TasksInlineKeyboard);
    }
    msg = await getTasksMsg(ctx, true);
    return await ctx.replyWithHTML(msg, closeAllInlineKeyboard);
}

const next15TasksInlineKeyboard = Markup.inlineKeyboard([
    [ Markup.button.callback('Cледующие 15 »', 'next15') ],
    [ Markup.button.callback('📥 Скачать стикеры PDF', 'downloadStickers') ],
    [ Markup.button.callback('❌ Закрыть', 'closeAllTasks') ]
]).resize()

const prev15TasksInlineKeyboard = Markup.inlineKeyboard([
    [ Markup.button.callback('« Предыдущие 15', 'prev15') ],
    [ Markup.button.callback('📥 Скачать стикеры PDF', 'downloadStickers') ],
    [ Markup.button.callback('❌ Закрыть', 'closeAllTasks') ]
]).resize()

const prevNext15TasksInlineKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('« Предыдущие 15', 'prev15'),
        Markup.button.callback('Следующие 15 »', 'next15')
    ],
    [ Markup.button.callback('📥 Скачать стикеры PDF', 'downloadStickers') ],
    [ Markup.button.callback('❌ Закрыть', 'closeAllTasks') ]
]).resize()

const closeAllInlineKeyboard =  Markup.inlineKeyboard([
    Markup.button.callback('❌ Закрыть', 'closeAllTasks')
]).resize()


module.exports = {
    showTasks,
    next15TasksInlineKeyboard,
    prev15TasksInlineKeyboard,
    prevNext15TasksInlineKeyboard,
    closeAllInlineKeyboard
}
