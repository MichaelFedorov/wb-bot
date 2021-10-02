const { Markup } = require('telegraf');

/**
 * Returns back keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
// export const getBackKeyboard = (ctx: ContextMessageUpdate) => {
//   const backKeyboardBack = ctx.i18n.t('keyboards.back_keyboard.back');
//   let backKeyboard: any = Markup.keyboard([backKeyboardBack]);

//   backKeyboard = backKeyboard.resize().extra();

//   return {
//     backKeyboard,
//     backKeyboardBack
//   };
// };

/**
 * Returns main keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
const mainKeyboard = Markup.keyboard([
    ["📦 Сборочные задания", "💰 Продажи"],
    ["⚙️ Настройки", "📃 Инструкция"],
    ["✍️ Связаться с нами"]
  ])
  .resize();

const tasksKeyboard = Markup.keyboard([
  ["🆕 Новые"],
  ["⚒ На сборке", "Собранные"],
  ["⬅️ Назад"]
])
.resize();

const newTasksKeyboard = Markup.keyboard([
  ["Последний заказ", "🔍 Смотреть все"],
  ["⬅️ Назад"],
])
.resize();

module.exports = {
  mainKeyboard,
  tasksKeyboard
}
