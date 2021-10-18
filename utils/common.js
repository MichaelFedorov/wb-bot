const axios = require('axios');
const {mainKeyboard} = require("./keyboards");
const { ordersUrl, stocksUrl } = require('../config');

const returnToMainScreen = async ctx => {
  await ctx.reply('Чем могу помочь?', mainKeyboard);
}

const sleep = sec => {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

const isApiKeyValid = async apiKey => {
  const date = new Date().toISOString();
  if (apiKey.length === 149) {
    return await axios.get(`${ordersUrl}${date}&take=1&skip=0`, {
      headers: {
        authorization: apiKey,
      }
    })
      .then((response) => {
        return true;
      })
      .catch((e) => {
        console.log(e)
        return false;
      });
  } else {
    return false
  }
};

module.exports = {
  sleep,
  isApiKeyValid,
  returnToMainScreen
}
