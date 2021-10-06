const { Markup } = require('telegraf');

const confirmationInlineKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('✅ Да', 'confirm'),
    Markup.button.callback('🚫 Отмена', 'cancel')
]).resize()

module.exports = {
    confirmationInlineKeyboard
}