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
        `Привет, ${ctx?.from?.first_name}!`,
        mainKeyboard
      );
      return await ctx.scene.leave();
    } else {
      ctx.reply('❗️Используемый ранее ключ неактивен. Для правильной работы необходимо заменить его в Настройках бота.', mainKeyboard);
      await ctx.scene.leave();
    }
  } else {
    await ctx.replyWithHTML(`Привет, ${ctx?.from?.first_name}! Я бот <b>SellerGo</b> - ваш личный ассистент в мире Wildberries. Чтобы начать нашу работу, введите, пожалуйста, e-mail.`, {reply_markup: {remove_keyboard: true}})
    return ctx.wizard.next();
  }
}

const emailHandler = Telegraf.on('text', async ctx => {
  if (validateEmail(ctx.message.text)) {

    ctx.scene.state.email = ctx.message.text;

    await ctx.replyWithHTML(
      `Отлично! Теперь введите <b>токен (API ключ)</b> для работы  от новой версии API.

Чтобы скопировать токен, зайдите в личный кабинет WB -> Мой профиль -> Доступ к новому API и нажмите Сгенерировать токен.
    `);

    return ctx.wizard.next();
  } else {
    await ctx.replyWithHTML(`❗️Что-то не так… вышлите e-mail ещё раз.`);
  }
});

const apiHandler = Telegraf.on('text', async ctx => {
  const wbApiKey = ctx.message.text;
  try {
    let isApiValid = await isApiKeyValid(wbApiKey);
    await ctx.reply('Идёт проверка API ключа...');

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
        `Супер! У вас активирован бесплатный пробный период на 5 дней.

Теперь вы будете получать уведомления о новых сборочных заданиях в telegram.

Кроме того, предлагаем ознакомиться со всеми возможностями бота в главном меню.
        `,
        mainKeyboard
      );

      await startNotifications(ctx);

      return await ctx.scene.leave();
    } else {
      await ctx.replyWithHTML(`❗️Хм… Введённый API ключ не принимается серверами Wildberries. Проверьте, пожалуйста, и введите его снова.

Если ошибка повторяется, попробуйте создать новый ключ для работы с ботом. Это просто: зайдите в личный кабинет WB -> Мой профиль -> Доступ к новому API и нажмите Сгенерировать токен.

Если не получается, напишите в @SellerGoChat, всё решим`);
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
