const { Telegraf, Scenes: { WizardScene } } = require("telegraf");
const { validateEmail } = require("./helpers");

const { isApiKeyValid } = require("../../utils/common");

const { mainKeyboard } = require("../../utils/keyboards");
const { startNotifications } = require("../../utils/notifier");
const {
  createUser,
  isUserAlreadyCreated
} = require("../../utils/db");

const askEmail = async (ctx) => {
  const user = await isUserAlreadyCreated(ctx.from.id)
    .then(r => {
      return r
    })
    .catch(e => {
      console.log(e)
      return false
    });

  if (user) {
    const isApiValid = await isApiKeyValid(user?.wbApiKey);
    ctx.session.user = user;
    if (isApiValid) {
      // TODO: to resolve duplicate, we have the same wbApiKey in user object
      await startNotifications(ctx);
      await ctx.reply(
        `Привет, ${user.name}!`,
        mainKeyboard
      );
      return await ctx.scene.leave();
    } else {
      ctx.reply('Используемый ранее ключ неактивен. Для правильной работы бота необходимо заменить его в Настройках', mainKeyboard);
      return await ctx.scene.leave();
    }
  } else {
    await ctx.reply('Введите ваш email', {reply_markup: {remove_keyboard: true}})
    return ctx.wizard.next();
  }
}

const emailHandler = Telegraf.on('text', async ctx => {
  if (validateEmail(ctx.message.text)) {

    ctx.scene.state.email = ctx.message.text;

    await ctx.replyWithHTML(
      `Отлично! Далее введите <b>токен для работы с API (API ключ):</b> от новой версии API.

Если у вас его нет, зайдите в личный кабинет WB -> Мой профиль -> Доступ к новому API и нажмите Сгенерировать токен.
    `);

    return ctx.wizard.next();
  } else {
    await ctx.replyWithHTML(`❗️ <b>Вы ввели неверный email</b>. Проверьте и введите снова`);
  }
});

const apiHandler = Telegraf.on('text', async ctx => {
  const wbApiKey = ctx.message.text;
  try {
    let isApiValid = await isApiKeyValid(wbApiKey);
    await ctx.reply('Выполняется проверка API ключа ...');

    if (isApiValid) {
      const user = {
        id: ctx?.from?.id,
        userName: ctx?.from?.username,
        email: ctx?.scene?.state?.email,
        wbApiKey,
        name: `${ctx?.from?.first_name} ${ctx?.from?.last_name}`,
        // TODO notification based on payment
        notification: true,
        /* initial subscription for next 5 days */
        subscribeValid: new Date(new Date().getTime() + 5*24*60*60*1000).toISOString()
      }
      ctx.session.user = await createUser({...user}).then(r => r?.data)
      console.log('new user added', ctx.session.user)

      await ctx.reply(
        `Супер! Теперь вы будете автоматически получать уведомления о новых сборочных заданиях в боте.

Также вы можете пользоваться всеми возможностями бота при помощи главного меню.`,
        mainKeyboard
      );

      await startNotifications(ctx);

      return await ctx.scene.leave();
    } else {
      await ctx.replyWithHTML(`❗️ <b>Введеный вами API ключ не принимается серверами Wildberries.</b>
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

module.exports = startWizard;
