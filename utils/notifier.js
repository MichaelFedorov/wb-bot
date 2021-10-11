const axios = require('axios');

const { ordersUrl, stocksUrl } = require('../config');

const getStocks = async (ctx) =>  {
	await axios.get(`${stocksUrl}`, {
		headers: {
			authorization: ctx.session.apiKey,
		}
	})
	.then((response) => {
		stocks = response.data.stocks;
        ctx.session.stocks = stocks;
	})
    .catch((e) => {
        console.error(e);
    })
}

const checkForNewTasks = async (ctx) => {
	//const date = new Date().toISOString();
	const date = '2021-10-11T00:00:00.522Z';
	let tasks = [];
	await getStocks(ctx);

	await axios.get(`${ordersUrl}${date}&status=0&take=1000&skip=0`, {
		headers: {
			authorization: ctx.session.apiKey
		}
	})
	.then((response) => {
		tasks = response.data.orders;
	})
	.catch((e) => {
		console.error(e);
	})

	//if (ctx.session.prevTasksTotal !== tasks.length) return;

	const tasksList = tasks.map(task => {
		return {
			...task,
			...ctx.session.stocks.find(item => item.barcode === task.barcode)
		}
	});
	ctx.session.newTasksN = tasksList;
	notifyUser(ctx);
}

const notifyUser = async ctx => {
	// TODO: check for payments
	ctx.session.newTasksN.forEach(task => {
		const msg = getMsg(task);
		return ctx.replyWithPhoto(`https://images.wbstatic.net/big/new/33420000/33425311-1.jpg`, {
			parse_mode: 'HTML',
			caption: msg
		});
	})
}

const getMsg = (task) => {
	const msg = `
	✅<b>Новое задание</b>

	<b>${task.subject}</b>
	------
	<i>артикул:</i> ${task.article}
	<i>pазмер:</i> ${task.barcode}
	<i>pазмер:</i> ${task.size}
	<i>цена:</i> ${task.totalPrice/100} ₽

	<i>Остаток: </i> <b>${task.stock}шт.</b>
		`;

	return msg;
}

module.exports = {
	checkForNewTasks
}





