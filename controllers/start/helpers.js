const faunadb = require("faunadb");
const axios = require("axios");
const {ordersUrl} = require("../../config");

const { Select, Get, Match, Identify, Index, Create, Collection, Paginate } = faunadb.query;

let client = new faunadb.Client({ secret: process.env.FDB_FQL_SERVER_KEY });

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

const findUserById = async id => {
    try {
        const _res = await client.query(
          Select(["ref"], Get(Match(Index("id"), id)))
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

const validateApiByUserId = async (userId, apiKey) => {
  try {
    const keyUsedBy = client.query(
      Paginate(Match(Index('wbApiKey'), apiKey))
    )
    console.log(keyUsedBy)
    return keyUsedBy?.data?.length > 0;
  } catch (e) {
    console.error(e)
    return false
  }
};

const isApiKeyValid = async apiKey => {

  const isApiValid = await axios.get(`${ordersUrl}${date}&take=1000&skip=0`, {
    headers: {
      authorization: apiKey,
    }
  })
    .then((response) => {
      return true;
    })
    .catch((e) => {
      console.log(e)
      return false;
    });

  return isApiValid;
};

module.exports = {
  findUserByEmail,
  findUserById,
  isApiKeyValid,
  matchUserIdWithAoiKey,
  validateEmail,
  validateApiByUserId
}
