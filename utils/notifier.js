const axios = require('axios');
const CronJobManager = require('cron-job-manager');
const { sleep } = require('./common')
const { ordersUrl, stocksUrl } = require('../config');

const manager = new CronJobManager();

const startNotifications = async (ctx) => {
	ctx.session.prevTasksTotal = 0;
	manager.add(
		`notification_tasks_${ctx.session.user.id}`,
		'* */5 * * * *',
		async () => {
			await checkForNewTasks(ctx);
		},
		{
			start:true,
		}
	);
}

const getStocks = async (ctx) =>  {
	await axios.get(`${stocksUrl}`, {
		headers: {
			authorization: ctx.session.user.wbApiKey,
		}
	})
	.then((response) => {
		ctx.session.stocks = response.data.stocks;
	})
    .catch((e) => {
        console.error(e);
    })
}

const checkForNewTasks = async (ctx) => {
	const date = `${new Date().toISOString().split('T')[0]}T03:00:00.522Z`;
	let tasks = [];
	await getStocks(ctx);

	await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
		headers: {
			authorization: ctx.session.user.wbApiKey
		}

	})
	.then((response) => {
		tasks = response.data.orders;
	})
	.catch((e) => {
		console.error(e);
	})

	if (ctx.session.prevTasksTotal !== tasks.length) return;

	const tasksList = tasks.map(task => {
		return {
			...task,
			...ctx.session.stocks.find(item => item.barcode === task.barcode)
		}
	});
	ctx.session.newTasksN = tasksList;
	ctx.session.prevTasksTotal = tasks.length;
	notifyUser(ctx);
}

const notifyUser = async ctx => {
	// TODO: check for payments
	for (task of ctx.session.newTasksN) {
		const msg = getMsg(task);
		await sleep(2);
		// TODO: check if we can send photo
		ctx.replyWithPhoto(`https://images.wbstatic.net/big/new/33420000/33425311-1.jpg`, {
			parse_mode: 'HTML',
			caption: msg
		});
	}
}

const getMsg = (task) => {
	const msg = `
	✅<b>Новое задание</b>

	<b>${task.subject}</b>
	------
	<i>артикул:</i> ${task.article}
	<i>штрихкод:</i> ${task.barcode}
	<i>pазмер:</i> ${task.size}
	<i>цена:</i> ${task.totalPrice/100} ₽

	Остаток: <b>${task.stock}шт.</b>
		`;

	return msg;
}

module.exports = {
	checkForNewTasks,
	startNotifications
}




