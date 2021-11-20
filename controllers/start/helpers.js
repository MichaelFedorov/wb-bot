const {MongoClient} = require('mongodb');
const uri = 'mongodb+srv://localhost?retryWrites=true&w=majority'
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'wb_bot_test'

const regExp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]/i;

const validateEmail = (email) => {
    return regExp.test(email)
}

const findUserByEmail = async email => {
  // Connect to the MongoDB cluster
  await client.connect();
  try {
      return await client.db(dbName).collection("Users").findOne({ email: email });
  } catch (e) {
      console.log(e.status);
  } finally {
    await client.close();
  }
};

const matchUserIdWithApiKey = async (id, key) => {
  // Connect to the MongoDB cluster
    await client.connect();
    try {
        const _id = await client.db(dbName).collection("Users").findOne({ id: id });// await client.query(Identify(Match(Index("id"), user), key));
        console.log(_id);
    } catch (e) {
        console.log(e);
    } finally {
      await client.close();
    }
};

const validateApiByUserId = async (userId, wbApiKey) => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    const keyUsedBy = await client.db(dbName).collection("Users").findOne({ wbApiKey: wbApiKey, id: userId });
    console.log(keyUsedBy)
    return !!keyUsedBy;
  } catch (e) {
    console.error(e);
    return false
  } finally {
    await client.close();
  }
};

module.exports = {
  findUserByEmail,
  matchUserIdWithApiKey,
  validateEmail,
  validateApiByUserId
}
