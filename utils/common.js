require('dotenv').config()
const {mainKeyboard} = require("./keyboards");

const returnToMainScreen = async ctx => {
  await ctx.reply('Чем могу помочь?', mainKeyboard);
}

const sleep = sec => {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

module.exports = {
  sleep,
  returnToMainScreen
}
