const {
  Telegraf,
  Scenes: { WizardScene },
} = require("telegraf");
const { validateEmail, validateApiByUserId } = require("./helpers");
const axios = require("axios");

const { ordersUrl } = require("../../config");

const { mainKeyboard } = require("../../util/keyboards");

const askEmail = async (ctx) => {
    await ctx.reply('Введите ваш email', { reply_markup: { remove_keyboard: true } });
    return ctx.wizard.next();
}

const emailHandler = Telegraf.on('text', async ctx => {
    if (validateEmail(ctx.message.text)) {

        ctx.scene.state.email = ctx.message.text;

        await ctx.replyWithHTML(
          `Отлично! Далее введите <b>API ключ</b> от новой версии API. Если вы его еще не создавали, зайдите в личный кабинет WB и выполните необходимые действия.`
        );

        return ctx.wizard.next();
    } else {
        await ctx.replyWithHTML(`❗️ <b>Вы ввели неверный email</b>. Проверьте и введите снова`);
    }
});

const apiHandler = Telegraf.on('text', async ctx => {
  const apiKey = ctx.message.text;
  const isApiKeyAssigned = await validateApiByUserId(ctx.user.id, apiKey)
  try {
    let isApiValid = false;
    const date = new Date().toISOString();

    await ctx.reply('Выполняется проверка API ключа ...');
    if(!isApiKeyAssigned) {
      await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
        headers: {
          authorization: apiKey,
        }
      })
        .then((response) => {
          isApiValid = true;
        })
        .catch((e) => {
          console.log(e)
          isApiValid = false;
        })
    }

    if (!isApiKeyAssigned) {
      await ctx.reply(
        "Ваш API ключ уже используется другим аккаунтом",
        mainKeyboard
      );

      return await ctx.scene.leave();
    } else if (isApiValid) {
        ctx.session.email = ctx.scene.state.email;
        ctx.session.apiKey = ctx.message.text;

    await ctx.reply(
      "Супер! Теперь вы сможете пользоваться всеми возможностями бота.",
      mainKeyboard
    );

    return await ctx.scene.leave();
  } else {
    await ctx.replyWithHTML(`❗️ <b>Введеный вами API ключ не принимается серверами wildberries.</b>
Проверьте, пожалуйста, и введите снова.
Если ошибка повторяется, попробуйте создать новый ключ для работы с ботом или свяжитесь с нами.`);
      }
  }
  catch(e) {
      console.error(e)
  }
});

const startWizard = new WizardScene(
    'start',
    askEmail,
    emailHandler,
    apiHandler
);


// start.enter(async (ctx) => {
//   const uid = String(ctx.from.id);
// //   const user = await User.findById(uid);
// //   const { mainKeyboard } = getMainKeyboard(ctx);

// //   if (user) {
// //     await ctx.reply(ctx.i18n.t('scenes.start.welcome_back'), mainKeyboard);
// //   } else {
// //     logger.debug(ctx, 'New user has been created');
// //     const now = new Date().getTime();

// //     const newUser = new User({
// //       _id: uid,
// //       created: now,
// //       username: ctx.from.username,
// //       name: ctx.from.first_name + ' ' + ctx.from.last_name,
// //       observableMovies: [],
// //       lastActivity: now,
// //       totalMovies: 0,
// //       language: 'en'
// //     });

// //     await newUser.save();
//     await ctx.reply('Введите ваш email адрес');
// //   }
// });

// start.leave(async (ctx: ContextMessageUpdate) => {
//   const { mainKeyboard } = getMainKeyboard(ctx);

//   await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
// });

// start.command('saveme', leave());
// start.action(/languageChange/, languageChangeAction);
// start.action(/confirmAccount/, async (ctx: ContextMessageUpdate) => {
//   await ctx.answerCbQuery();
//   ctx.scene.leave();
// });

module.exports = startWizard;
