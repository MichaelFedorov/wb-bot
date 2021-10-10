const faunadb = require("faunadb");
const axios = require("axios");
const {ordersUrl, stocksUrl, authorizationKey} = require("../../config");
const { Markup } = require('telegraf');
const { bot } = require('../../utils/init')

const { Select, Get, Match, Identify, Index, Create, Collection, Paginate } = faunadb.query;

let client = new faunadb.Client({
  secret: process.env.FDB_FQL_SERVER_KEY,
  domain: 'db.eu.fauna.com',
  scheme: 'https'
});

const regExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const validateEmail = (email) => {
    return regExp.test(email)
}

const findUserByEmail = async email => {
    try {
      return await client.query(
          Select(["ref"], Get(Match(Index("email"), email)))
        );
    } catch (e) {
        console.log(e.status);
    }
};

const matchUserIdWithAoiKey = async (id, key) => {
    try {
        const _id = await client.query(
          Identify(Match(Index("id"), user), key)
        );
        console.log(_id);
    } catch (e) {
        console.log(e);
    }
};

const validateApiByUserId = async (userId, wbApiKey) => {
  try {
    const keyUsedBy = client.query(
      Paginate(Match(Index('wbApiKey'), wbApiKey))
    )
    console.log(keyUsedBy)
    return keyUsedBy?.data?.length > 0;
  } catch (e) {
    console.error(e)
    return false
  }
};

const isApiKeyValid = async apiKey => {
  const date = new Date().toISOString();
  return await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
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
};

const newOrderReplyHtml = (ctx, order) => {
  const message = `
	<b>Заказов за сегодня:</b> ${ctx?.session?.ordersTotal || 0}
✅<b>Новый заказ</b>✅
<b>${order.subject}</b>
------
<i>артикул:</i> ${order.article}
<i>pазмер:</i> ${order.size}
<i>цена:</i> ${order.totalPrice/100} ₽
	`;
  if(ctx?.session?.ordersTotal) {
    bot.telegram.sendMessage(ctx.session.user.id, message, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        Markup.button.callback('📝 Все заказы', 'showAllOrders'),
        //Markup.button.callback('Принять заказ', 'accept'),
      ])}
    )
  }
}

const getStocks = async ctx =>  {
  let stocks = [];
  await axios.get(`${stocksUrl}`, {
    headers: {
      authorization: ctx.session.apiKey || authorizationKey,
    }
  })
    .then((response) => {
      stocks = response.data.stocks
    })
  return stocks
}

const getOrders = async (ctx) => {
  try {
    let orders = [];
    const date = new Date().toISOString()
    await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
      headers: {
        authorization: ctx.session.user.wbApiKey,
      }
    })
      .then((response) => {
        orders = response.data.orders;
      });

    if (ctx.session.ordersTotal === orders.length) {
      return
    }

    ctx.session.ordersTotal = orders.length;
    const stocks = await getStocks(ctx);
    const newOrderData = orders[orders.length-1];
    const newOrders = newOrderData ? {...stocks.find(item => item.barcode === newOrderData.barcode)} : {}
    const newOrder = { ...newOrderData, ...newOrders };
    ctx.orders = orders.map(order => {
      return {
        ...order,
        ...stocks.find(item => item.barcode === order.barcode)
      }
    });
    //await newOrderReplyWithPhoto(newOrder);
    return newOrder ? newOrderReplyHtml(ctx, newOrder) : null
  }
  catch (error){
    console.error(error)
  }
}

module.exports = {
  findUserByEmail,
  isApiKeyValid,
  matchUserIdWithAoiKey,
  validateEmail,
  validateApiByUserId,
  getOrders
}
