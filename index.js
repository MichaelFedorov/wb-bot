require('dotenv').config()
const { Telegraf, session, Scenes: { Stage }, Markup } = require('telegraf');
const startWizard = require('./controllers/start');
const tasksScene = require('./controllers/tasks');
const settingsScene = require('./controllers/settings');

/* fauna DB features */

const faunadb = require("faunadb");
let client = new faunadb.Client({
  secret: 'fnAEUy-13IAAx4CcXH_IqaZ_9rgx9pz0FdbXgLzV',
  domain: 'db.eu.fauna.com',
  scheme: 'https',
});
const q = faunadb.query;
const { Collection, Documents, Paginate } = q;


/* end FaunaDB features */

const { sale, allOrders, allSalesToday } = require('./util/constants')
const axios = require('axios');
// const cron = require('node-cron');

const config = require('./config');
const data = require('./data');

const bot = new Telegraf(process?.env?.BOT_TOKEN);

const stage = new Stage([
	startWizard,
	tasksScene,
	settingsScene
]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
	ctx.scene.enter('start');
});
bot.hears('📦 Сборочные задания', ctx => ctx.scene.enter('tasks'));
bot.hears('⚙️ Настройки', ctx => ctx.scene.enter('settings'));
bot.hears('testFaunaDb',  async ctx => {
  try {
    const users = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection("Users"))),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    )

    return ctx.replyWithHTML('users', users?.data[0]?.data)
  } catch (e) {
    return console.error('error', e)
  }
})

bot.hears(sale, (ctx) => {
	ctx.db.orders = [],
	ctx.db.ordersTotal = 0;
	ctx.db.fbsDate = new Date().toISOString()
})

bot.hears(allOrders, (ctx) => {
	showAllOrders(ctx);
})

// const reset
const getOrders = async (ctx) => {
	try {
		let orders = [];
		db = bot.context.db;
		await axios.get(`${config.ordersUrl}${db.fbsDate}&take=1000&skip=0`, {
			headers: {
				authorization: config.authorizationKey,
			}
		})
		.then((response) => {
			orders = response.data.orders;
		});

		if (db.ordersTotal === orders.length) {
			return
		}

		db.ordersTotal = orders.length;
		const stocks = await getStocks();
		const newOrderData = orders[orders.length-1];
		const newOrder = { ...newOrderData, ...stocks.find(item => item.barcode === newOrderData.barcode) };
		db.orders = orders.map(order => {
			return {
				...order,
				...stocks.find(item => item.barcode === order.barcode)
			}
		});
		return newOrderReplyHtml(newOrder);
	}
	catch (error){
		console.error(error);
	}
}

const getStocks = async () =>  {
	await axios.get(`${config.stocksUrl}`, {
		headers: {
			authorization: config.authorizationKey,
		}
	})
	.then((response) => {
		stocks = response.data.stocks
	})
	return stocks
}

const newOrderReplyWithPhoto = (order, ctx) => {
	orderArticle = data.report.find(item => item.barcode === order.barcode).article;
	return ctx.replyWithPhoto({ url: `https://images.wbstatic.net/big/new/${orderArticle.substr(0,4)}0000/${orderArticle}-1.jpg` });
}

const newOrderReplyHtml = (order) => {
	const msg = `
	<b>Заказов за сегодня:</b> ${bot.context.db.ordersTotal}

✅<b>Новый заказ</b>✅

<b>${order.subject}</b>
------
<i>артикул:</i> ${order.article}
<i>pазмер:</i> ${order.size}
<i>цена:</i> ${order.totalPrice/100} ₽
	`;
	config.admins.forEach(adminId =>{
		bot.telegram.sendMessage(adminId, msg, {
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				Markup.button.callback('📝 Все заказы', 'showAllOrders'),
				//Markup.button.callback('Принять заказ', 'accept'),
			])}
		)
	})
}

bot.action('showAllOrders', async (ctx) => {
	await ctx.answerCbQuery();
	showAllOrders(ctx);
})

// bot.action('accept', async (ctx) => {
// 	await ctx.answerCbQuery();
// 	console.log(ctx.db.orders[ctx.db.orders.length-1].orderId);
// 	await axios({
// 		method: 'put',
// 		url: config.updateOrderStatusUrl,
// 		data: [{
// 			orderId: ctx.db.orders[ctx.db.orders.length-1].orderId,
// 			status: 1
// 		}],
// 		headers: {
// 			authorization: config.authorizationKey,
// 		}
// 	}).then(response => {
// 		console.log(response)
// 	})
// 	ctx.replyWithHTML('Заказ принят')
// })

const showAllOrders = (ctx) => {
	let ordersMsg = '';
	ctx.db.orders.forEach(order => {
		ordersMsg = `${ordersMsg}
--------------------------------------------
📍 <b>${order.subject}</b>  |   ${order.article}   |    ${order.size.split('/')[0]}    |  ${order.totalPrice/100} ₽`});
	ordersMsg += `

<b>Всего заказов на сбор:</b> ${ctx.db.orders.length}`
	ctx.replyWithHTML(ordersMsg);
}


bot.launch()

// Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))
