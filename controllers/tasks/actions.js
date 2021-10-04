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

const getTasks = async (ctx, status) => {
    // TODO date = - 4 days from now
    const date = '2021-10-01T00:00:00.522Z';
    await getStocks(ctx);

    await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
        headers: {
            authorization: ctx.session.apiKey
        }
    })
    .then((response) => {
        const tasks = response.data.orders.reverse();
		const tasksList = tasks.map(task => {
			return {
				...task,
				...ctx.session.stocks.find(item => item.barcode === task.barcode)
			}
		});
        if (status === 0 ) {
            ctx.session.newTasks = tasksList.filter(task => task.status === status);
        } else if (status === 1) {
            ctx.session.onAssemblyTasks = tasksList.filter(task => task.status === status);
        }
        else if (status === 2) {
            ctx.session.readyTasks = tasksList.filter(task => task.status === status);
        }
    })
    .catch((e) => {
        console.log(e)
    })
};

const getTasksMsg = async (ctx, all) => {
    let msg = '';
    const tasks = ctx.session.tasks.slice(ctx.session.firstTask, ctx.session.lastTask);
	tasks?.forEach((task, index) => {
		msg = `${msg}
--------------
📦 0${ctx.session.firstTask + index + 1} | <b>${task.subject}</b> | ${task.article} | ${task.size.split('/')[0]} | ${task.totalPrice/100} ₽
шк ${task.barcode} | стикер ${task.sticker.wbStickerId}
<b>В наличии:</b> ${task.stock} шт.
`});

	msg += 
    `

Показано c <b>${ctx.session.firstTask + 1}</b> по <b>${ctx.session.lastTask}</b> из <b>${ctx.session.tasks.length}</b> заданий. `;

    return msg;
}

module.exports = {
    getTasks,
    getTasksMsg,
}