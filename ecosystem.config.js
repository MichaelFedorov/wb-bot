module.exports = {
  apps: [{
    name: "app",
    script: "./index.js",
    env: {
      NODE_ENV: "development"
    },
    env_test: {
      NODE_ENV: "test",
    },
    env_staging: {
      NODE_ENV: "staging",
      BOT_TOKEN: '2022873163:AAF9j6zPufl0FhBbzgT90X3XnrLnXfqkTm4',
      ADMINS_IDS: [],
      PUBLIC_ID_CLOUD_PAYMENTS: 'pk_f4246e3d8fd85abba6d4306db4aa5',
      PASSWORD_CLOUD_PAYMENTS: 'c0146e07c84dda268213e0670c271855',
      DB_NAME: 'wb_bot_test',
      DB_USER_NANE: 'wbAdmin',
      DB_PASSWORD: 'gthtrhtcnjr123',
      DB_HOST: 'localhost:27017'
    },
    env_production: {
      NODE_ENV: "production",
      BOT_TOKEN: '2022873163:AAF9j6zPufl0FhBbzgT90X3XnrLnXfqkTm4',
      ADMINS_IDS: [],
      PUBLIC_ID_CLOUD_PAYMENTS: 'pk_f4246e3d8fd85abba6d4306db4aa5',
      PASSWORD_CLOUD_PAYMENTS: 'c0146e07c84dda268213e0670c271855',
      DB_NAME: 'wb_bot_test',
      DB_USER_NANE: 'wbAdmin',
      DB_PASSWORD: 'gthtrhtcnjr123',
      DB_HOST: 'localhost:27017'
    }
  }]
}