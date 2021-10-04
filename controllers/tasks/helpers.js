const { Markup } = require('telegraf');

const newTasksInlineKeyboard =  Markup.inlineKeyboard([
    //Markup.button.callback('Добавить все к сборке', 'acceptAll'),
    Markup.button.callback('Смотреть все', 'seeAllNew')
])

const next15TasksInlineKeyboard =  Markup.inlineKeyboard([
    //Markup.button.callback('Добавить все к сборке', 'acceptAll'),
    Markup.button.callback('Cледующие 15', 'next15'),
    Markup.button.callback('❌ Закрыть', 'closeAllTasks')
])

const prev15TasksInlineKeyboard =  Markup.inlineKeyboard([
    //Markup.button.callback('Добавить все к сборке', 'acceptAll'),
    Markup.button.callback('Предыдущие 15', 'prev15'),
    Markup.button.callback('❌ Закрыть', 'closeAllTasks')
])

const closeAllInlineKeyboard =  Markup.inlineKeyboard([
    //Markup.button.callback('Добавить все к сборке', 'acceptAll'),
    Markup.button.callback('❌ Закрыть', 'closeAllTasks')
])

module.exports = { 
    newTasksInlineKeyboard,
    next15TasksInlineKeyboard,
    prev15TasksInlineKeyboard,
    closeAllInlineKeyboard
}