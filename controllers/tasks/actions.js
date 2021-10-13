const axios = require('axios');
const { ordersUrl, stocksUrl } = require('../../config');

const getStocks = async (ctx) =>  {
    // TODO: check if stocks in session then not to call api
	await axios.get(`${stocksUrl}`, {
		headers: {
			authorization: ctx.session.user?.wbApiKey,
		}
	})
	.then((response) => {
    ctx.session.stocks = response?.data?.stocks;
	})
  .catch((e) => {
      console.log(e);
  })
}

const getTasks = async (ctx, status) => {
  const date = new Date();
  date.setDate(date.getDate() - 5);
  if(!ctx.session.stock) { 
    await getStocks(ctx);
  }

  await axios.get(`${ordersUrl}${date.toISOString()}&take=1000&skip=0`, {
    headers: {
      authorization: ctx.session.user?.wbApiKey
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
      console.log(e);
      ctx.reply('Используемый ранее ключ неактивен. Для правильной работы бота необходимо заменить его в Настройках');
      ctx.session.tasks = [];
      ctx.session.newTasks = [];
      ctx.session.readyTasks = [];
      ctx.session.onAssemblyTasks = [];
  })
};

const getTasksMsg = async (ctx) => {
  let msg = '';
  const tasks = ctx.session?.tasks?.slice(ctx.session?.firstTask, ctx.session?.lastTask);
  if (tasks?.length > 0) {
      tasks?.forEach((task, index) => {
          msg = `${msg}
--------------
📦 0${ctx.session.firstTask + index + 1}  |  <b>${task.subject}</b>  |  ${task.article}  |  ${task.size.split('/')[0]}  |  ${task.totalPrice/100} ₽  |  шк ${task.barcode}  |  стикер ${task.sticker.wbStickerId}
<b>В наличии:</b> ${task.stock} шт.
  `});

      msg +=
      `

Показано c <b>${ctx.session.firstTask + 1}</b> по <b>${ctx.session.lastTask}</b> из <b>${ctx.session.tasks.length}</b> заданий. `;
  } else {
      msg = 'У вас пока нет заданий'
  }
  return msg;
}

module.exports = {
    getTasks,
    getTasksMsg,
}
