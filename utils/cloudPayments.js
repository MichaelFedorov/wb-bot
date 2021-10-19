
const payForSubscription = (user) => {
  const data = {
    "token":"477BBA133C182267FE5F086924ABDC5DB71F77BFC27F01F2843F2CDC69D89F05",
    "accountId":user?.email,
    "description":"Ежемесячная подписка на бота WB BOT",
    "email":user?.email,
    "amount":500,
    "currency":"RUB",
    "requireConfirmation":false,
    "startDate": new Date().toISOString(), // "2014-08-06T16:46:29.5377246Z",
    "interval":"Month",
    "period":1
  }

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

module.exports = {
  payForSubscription
}