const apiHost = 'https://suppliers-api.wildberries.ru';
module.exports = {
    ordersUrl: `${apiHost}/api/v2/orders?date_start=`,
    stocksUrl: `${apiHost}/api/v2/stocks?skip=0&take=1000`,
    stickersPdfUrl: `${apiHost}/api/v2/orders/stickers/pdf`,
    updateOrderStatusUrl: `${apiHost}/api/v2/orders`,
    authorizationKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NJRCI6IjA2N2QwMDM2LWJiZmUtNDJiNi05ZjZlLTRlNGE5YTgzN2M2YSJ9.C-X8ply9m7YQK1jJz3XiqB8SrKkLiEgjEGTyEygNelA',
    admins: [9746,1446196]
}