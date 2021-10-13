const faunadb = require("faunadb");
const axios = require("axios");
const {ordersUrl} = require("../../config");

const { Select, Get, Match, Identify, Index, Create, Collection, Paginate } = faunadb.query;

let client = new faunadb.Client({
  secret: process.env.FDB_FQL_SERVER_KEY,
  domain: 'db.eu.fauna.com',
  scheme: 'https'
});

const regExp = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const validateEmail = (email) => {
    return regExp.test(email)
}

const findUserByEmail = async email => {
    try {
        const _res = await client.query(
          Select(["ref"], Get(Match(Index("email"), email)))
        );
        return _res;
    } catch (e) {
        console.log(e.status);
    }
};

const matchUserIdWithAoiKey = async (id, key) => {
    try {
        const _id = await client.query(
          Identify(Match(Index("id"), user), key)
        );
        console.log(_id);
    } catch (e) {
        console.log(e);
    }
};

const validateApiByUserId = async (userId, wbApiKey) => {
  try {
    const keyUsedBy = client.query(
      Paginate(Match(Index('wbApiKey'), wbApiKey))
    )
    console.log(keyUsedBy)
    return keyUsedBy?.data?.length > 0;
  } catch (e) {
    console.error(e)
    return false
  }
};

module.exports = {
  findUserByEmail,
  matchUserIdWithAoiKey,
  validateEmail,
  validateApiByUserId
}
