require('dotenv').config()
const { dbToken } = require("../config");
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
  Select,
  Match,
  Index,
  Update
} = faunadb.query;
let client = new faunadb.Client({
  secret: dbToken,
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
    return userData?.data?.id === id ? userData?.data : null;
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

const findUserById = async id => {
  try {
    return await client.query(
      Select(["ref"], Get(Match(Index("id"), id)))
    );
  } catch (e) {
    console.log(e.status);
  }
};

const updateFieldDB = async (user, fieldName, value) => {
  try {
    return await client.query(
      Update(
        Ref(Collection('Users'), user.id),
        {
          data: {
            [fieldName]: value,
          },
        },
      )
    );
  } catch (e) {
    console.log(e.status)
  }
}

module.exports = {
  createUser,
  updateFieldDB,
  findUserById,
  getAllUsers,
  isUserAlreadyCreated
}
