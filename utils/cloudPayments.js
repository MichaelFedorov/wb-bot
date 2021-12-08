require('dotenv').config();
const axios = require('axios')
const CP_API = {
  create: 'https://api.cloudpayments.ru/test/subscriptions/create'
}

const { ClientService } = require('cloudpayments');
const client = new ClientService({
  endpoint: 'https://api.cloudpayments.ru', // test endpoint for validation
  privateKey: process.env.PASSWORD_CLOUD_PAYMENTS,
  publicId: process.env.PUBLIC_ID_CLOUD_PAYMENTS
});

const getPeriodByType = (type) => {
  switch (type) {
    case 'year':
      return 12;
    case 'quarter':
      return 3;
    case 'halfYear':
      return 6;
    default:
      return 1;
  }
}


const initiateSubscription = async (user, subscriptionType) => {
  const data = {
    "token":"477BBA133C182267FE5F086924ABDC5DB71F77BFC27F01F2843F2CDC69D89F05",
    "accountId":user?.email,
    "description":"Ежемесячная подписка на бота Seller GO BOT",
    "email":user?.email,
    "amount":500,
    "currency":"RUB",
    "requireConfirmation":false,
    "startDate": new Date().toISOString(), // "2014-08-06T16:46:29.5377246Z",
    "interval":"Month",
    "period":getPeriodByType(subscriptionType)
  }
  const cloudPayApi = client.getClientApi({
    endpoint: 'https://api.cloudpayments.ru/test', // test endpoint for validation
    privateKey: process.env.PASSWORD_CLOUD_PAYMENTS,
    publicId: process.env.PUBLIC_ID_CLOUD_PAYMENTS
  })
  const response = await cloudPayApi.createSubscription(data)
  console.log({response})
  return response
  /* cloudPayments API response example
  * {
   "Model":{
      "Id":"sc_8cf8a9338fb8ebf7202b08d09c938", //идентификатор подписки
      "AccountId":"user@example.com",
      "Description":"Ежемесячная подписка на сервис example.com",
      "Email":"user@example.com",
      "Amount":1.02,
      "CurrencyCode":0,
      "Currency":"RUB",
      "RequireConfirmation":false, //true для двухстадийных платежей
      "StartDate":"\/Date(1407343589537)\/",
      "StartDateIso":"2014-08-09T11:49:41", //все даты в UTC
      "IntervalCode":1,
      "Interval":"Month",
      "Period":1,
      "MaxPeriods":null,
      "StatusCode":0,
      "Status":"Active",
      "SuccessfulTransactionsNumber":0,
      "FailedTransactionsNumber":0,
      "LastTransactionDate":null,
      "LastTransactionDateIso":null,
      "NextTransactionDate":"\/Date(1407343589537)\/"
      "NextTransactionDateIso":"2014-08-09T11:49:41"
   },
   "Success":true
}
  *  */
}

const cancelSubscription = async Id => {
  await client.cancelSubscription({Id})
}

module.exports = {
  initiateSubscription,
  cancelSubscription
}
