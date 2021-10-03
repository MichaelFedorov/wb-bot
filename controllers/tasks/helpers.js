const { Markup } = require('telegraf');

const newTasksInlineKeyboard =  Markup.inlineKeyboard([
    Markup.button.callback('Добавить все к сборке', 'acceptAll'),
    Markup.button.callback('Смотреть все', 'seeAll')
])

module.exports = { 
    newTasksInlineKeyboard 
}