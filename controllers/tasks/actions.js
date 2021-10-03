const axios = require('axios');

const { ordersUrl, stocksUrl } = require('../../config');

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
        console.log(e);
    })
}

const getNewTasks = async (ctx) => {
    // TODO date = - 4 days from now
    const date = '2021-09-27T00:00:00.522Z';
    await getStocks(ctx);

    await axios.get(`${ordersUrl}${date}&status=1&take=1000&skip=0`, {
        headers: {
            authorization: ctx.session.apiKey
        }
    })
    .then((response) => {
        const tasks = response.data.orders.reverse();
		newTasks = tasks.map(task => {
			return {
				...task,
				...ctx.session.stocks.find(item => item.barcode === task.barcode)
			}
		});
        ctx.session.newTasks = newTasks;
    })
    .catch((e) => {
        console.log(e)
    })
};

const getNewTasksInitialMsg = async (ctx) => {
    let msg = '';
	ctx.session.newTasks?.forEach((task, index) => {
        if (index > 9) return
		msg = `${msg}
--------------
📦 0${index + 1} | <b>${task.subject}</b> | ${task.article} | ${task.size.split('/')[0]} | ${task.totalPrice/100} ₽
шк ${task.barcode} | стикер ${task.sticker.wbStickerId}
`});
	msg += 
    `

Показано <b>10</b> из <b>${ctx.session.newTasks?.length}</b> новых заданий. `;

    return msg;
}

module.exports = {
    getNewTasks,
    getNewTasksInitialMsg
}