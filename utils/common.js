require('dotenv').config()
const {mainKeyboard} = require("./keyboards");

const returnToMainScreen = async ctx => {
  await ctx.reply('Чем могу помочь?', mainKeyboard);
}

module.exports = {
  returnToMainScreen
}
