require('dotenv').config()
const {MongoClient} = require('mongodb');

const dbName = process?.env?.DB_NAME || 'wb_bot_test'
// URI link to mongoDb
const uri = 'mongodb://localhost?retryWrites=true&w=majority'
const client = new MongoClient(uri);

const createUser = async user => {
  try {

    // Connect to the MongoDB cluster
    await client.connect();

    const result = await client.db(dbName).collection("Users")
      .updateOne({id: user?.id}, {$set: user}, {upsert: true});
    return result?.upsertedCount ? {...user, _id: { "$oid": result?.upsertedId}} : null
  } catch (e) {
    console.error(e)
  } finally {
    await client.close();
  }
};

const isUserAlreadyCreated = async id => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    const userData = await client.db(dbName).collection("Users").findOne({ id: id });
    return userData?.id === id ? userData : null;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

const getAllUsers = async () => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    return await client.db(dbName).collection("Users")
  } catch (e) {
    console.log('error', e)
  } finally {
    await client.close();
  }
}

const findUserById = async id => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    return await client.db(dbName).collection("Users").findOne({ id: id });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

const updateFieldDB = async (user, fieldName, value) => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    return await client.db(dbName).collection("Users").updateOne({ id: user?.id }, { $set: {...user, [fieldName]: value} });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

module.exports = {
  createUser,
  updateFieldDB,
  findUserById,
  getAllUsers,
  isUserAlreadyCreated
}
