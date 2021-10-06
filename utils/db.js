require('dotenv').config()
const faunadb = require("faunadb");
const {
  Create,
  Collection,
  Get,
  Ref,
  Map,
  Paginate,
  Documents,
  Var,
  Lambda,
} = faunadb.query;
let client = new faunadb.Client({
  secret: process.env.FDB_FQL_SERVER_KEY,
  domain: 'db.eu.fauna.com',
  scheme: 'https'
});

const createUser = async user => {
  try {
    const userData = await client.query(
      Create(
        Ref(Collection('Users'), user.id),
        {data: {...user}},
      )
    );
    return userData;
  } catch (e) {
    console.error(e)
  }
};

const isUserAlreadyCreated = async id => {
  try {
    const userData = await client.query(
      Get(
        Ref(
          Collection('Users'),
          id
        )
      )
    );
    return userData?.data?.userId === id ? userData?.data : null;
  } catch (e) {
    console.error(e)
  }
}

const getAllUsers = async () => {
  try {
    const users = await client.query(
      Map(
        Paginate(Documents(Collection("Users"))),
        Lambda("X", Get(Var("X")))
      )
    )
    return users?.data
  } catch (e) {
    console.log('error', e)
  }
}

module.exports = {
  createUser,
  getAllUsers,
  isUserAlreadyCreated
}
