require('dotenv').config()
const { Telegraf, session, Scenes: { Stage }, Markup } = require('telegraf');
const startWizard = require('./controllers/start');
const tasksScene = require('./controllers/tasks');
const settingsScene = require('./controllers/settings');

const cron = require('node-cron');

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
bot.on('text', async ctx => {
  //console.log(ctx.scene);
	ctx.session.notifier.stop();
});

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



bot.launch()

// Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))
