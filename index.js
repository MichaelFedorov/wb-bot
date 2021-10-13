require('dotenv').config()
const { Telegraf, session, Scenes: { Stage }, Markup } = require('telegraf');
const startWizard = require('./controllers/start');
const tasksScene = require('./controllers/tasks');
const settingsScene = require('./controllers/settings');
const salesScene = require('./controllers/sales');

const { sale } = require('./utils/constants')
const axios = require('axios');
// const cron = require('node-cron');

const config = require('./config');
const data = require('./data');

const bot = new Telegraf(process?.env?.BOT_TOKEN);

const stage = new Stage([
	startWizard,
	tasksScene,
	settingsScene,
  salesScene
]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
	ctx.scene.enter('start');
});
bot.hears('📦 Сборочные задания', ctx => ctx.scene.enter('tasks'));
bot.hears('⚙️ Настройки', ctx => ctx.scene.enter('settings'));
//bot.hears('💰 Продажи', ctx => ctx.scene.enter('sales'));
bot.hears('💰 Продажи', ctx => ctx.reply('В разработке'));

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
