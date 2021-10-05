const { Markup } = require('telegraf');

const apiInlineKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Заменить ключ', 'replaceKey'),
    Markup.button.callback('Удалить ключ', 'removeKey')
]).resize()

const addApiKeyInlineKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Добавить ключ', 'addKey'),
]).resize()

module.exports = {
    apiInlineKeyboard,
    addApiKeyInlineKeyboard
}