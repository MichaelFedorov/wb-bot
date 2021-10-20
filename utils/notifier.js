const axios = require('axios');
const CronJobManager = require('cron-job-manager');
const { sleep } = require('./common')
const { ordersUrl, stocksUrl } = require('../config');

const manager = new CronJobManager();

const startNotifications = async (ctx) => {
	ctx.session.prevTasksTotal = 0;
	manager.add(
		`notification_tasks_${ctx.session.user.id}`,
		'*/20 * * * * *',
		async () => {
			await checkForNewTasks(ctx);
		},
		{
			start: true,
		}
	);
}

const getStocks = async (ctx) =>  {
	return await axios.get(`${stocksUrl}`, {
		headers: {
			authorization: ctx.session.user.wbApiKey,
		}
	})
	.then((response) => {
		ctx.session.stocks = response.data.stocks;
		return true;
	})
    .catch((e) => {
        console.error(e);
		return false
    })
}

const checkForNewTasks = async (ctx) => {
	const date = new Date( Date.now() - 1000 * 600 ).toISOString();
	let tasks = [];
	const isStosks = await getStocks(ctx);
	if (!isStosks) {
		ctx.reply('❗️Используемый ранее ключ неактивен. Для правильной работы и получения уведомлений необходимо заменить его в Настройках бота');
		return;
	};

	try {

		await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
			headers: {
				authorization: ctx.session.user.wbApiKey
			}
		})
		.then((response) => {
			tasks = response.data.orders.filter(item => item.status === 0);
		})
		.catch((e) => {
			console.error(e);
		})

		if (ctx.session.prevTasksTotal === tasks.length) return;

		ctx.session.newTasksN = tasks?.map(task => {
			return {
				...task,
				...ctx.session.stocks.find(item => item.barcode === task.barcode)
			}
		});
		ctx.session.prevTasksTotal = tasks.length;
		await notifyUser(ctx);
	} catch(err) {
		console.error(err)
	}
}

const notifyUser = async ctx => {
	// TODO: check for payments
	for (let task of ctx.session.newTasksN) {
		const msg = getMsg(task);
		await sleep(2);
		// TODO: check if we can send photo
		// await ctx.replyWithPhoto(`https://images.wbstatic.net/big/new/33420000/33425311-1.jpg`, {
		// 	parse_mode: 'HTML',
		// 	caption: msg
		// });
		await ctx.replyWithHTML(msg);
	}
}

const getMsg = (task) => {
  return `
	✅<b>Новое задание</b>

	<b>${task.subject}</b>
	------
	<i>артикул:</i> ${task?.article}
	<i>штрихкод:</i> ${task?.barcode}
	<i>pазмер:</i> ${task?.size}
	<i>цена:</i> ${task?.totalPrice / 100} ₽

	Остаток: <b>${task?.stock}шт.</b>
		`;
}

module.exports = {
	checkForNewTasks,
	startNotifications
}





