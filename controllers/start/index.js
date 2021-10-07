const {
  Telegraf,
  Scenes: {WizardScene},
} = require("telegraf");
const {
  validateEmail,
  validateApiByUserId,
  isApiKeyValid
} = require("./helpers");
const axios = require("axios");

const {ordersUrl} = require("../../config");

const {mainKeyboard} = require("../../utils/keyboards");
const {createUser,
  isUserAlreadyCreated
} = require("../../utils/db");

const askEmail = async (ctx) => {
  const isUserInDB = await isUserAlreadyCreated(ctx.from.id)
    .then(r => {
      return r
    })
    .catch(e => {
      console.log(e)
      return false
    });
  const isApiValid = await isApiKeyValid(isUserInDB?.wbApiKey)
  if(isUserInDB && isApiValid) {
    ctx.session.user = isUserInDB
    await ctx.reply(
      `Привет ${isUserInDB.name}!`,
      mainKeyboard
    );
    ctx.session = { ...ctx.session, ...isUserInDB }
    return await ctx.scene.leave();
  } else {
    await ctx.reply('Введите ваш email', {reply_markup: {remove_keyboard: true}})
    return ctx.wizard.next();
  }
    //await ctx.reply('Главное меню', mainKeyboard);
    //return await ctx.scene.leave()
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
  try {
    let isApiValid = await isApiKeyValid(apiKey);
    await ctx.reply('Выполняется проверка API ключа ...');

    // if(!isApiValid) {
    //   await ctx.reply(
    //     "Ваш API ключ уже используется другим аккаунтом",
    //     mainKeyboard
    //   );
    //   return await ctx.scene.leave();
    // }

    if (isApiValid) {
      ctx.session.email = ctx.scene.state.email;
      ctx.session.apiKey = ctx.message.text;
      const user = {
        userId: ctx?.from?.id,
        username: ctx?.from?.username,
        email: ctx?.scene?.state?.email,
        wbApiKey: apiKey,
        name: `${ctx?.from?.first_name} ${ctx?.from?.last_name}`
      }
      ctx.session.user = await createUser({...user}).then(r => r?.data)
      console.log('new user added', ctx.session.user?.data)

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
  } catch (e) {
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
