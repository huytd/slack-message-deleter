const fetch = require('node-fetch');
const FormData = require('form-data');
const config = require('./config.json');

const MESSAGE_COUNT = 500;

const WORKSPACE = config.workspace;
const CHANNEL = config.targetChannelId;
const USER = config.currentUserId;
const TOKEN = config.token;
const COOKIE = config.cookie;

if (!WORKSPACE || !CHANNEL || !USER || !TOKEN || !COOKIE) {
  console.log("Please config your workspace information in config.json!");
  return;
}

const delay = async function(time) {
  return new Promise((resolve, _) => {
    setTimeout(resolve, time);
  });
};


(async () => {

  const historyFetchForm = new FormData();
  historyFetchForm.append("token", TOKEN);
  historyFetchForm.append("channel", CHANNEL);
  historyFetchForm.append("limit", MESSAGE_COUNT + "");
  historyFetchForm.append("oldest", "0");
  historyFetchForm.append("latest", (Date.now() / 1000) + "");

  const data = await fetch("https://" + WORKSPACE + "/api/conversations.history", {
    "headers": {
      "accept": "*/*",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "cookie": COOKIE,
    },
    "referrerPolicy": "no-referrer",
    "body": historyFetchForm,
    "method": "POST"
  });

  const json = await data.json();

  for (let msg of json.messages) {
    const ts = msg.ts;
    if (msg.user === USER) {
      await delay(500);

      const deleteForm = new FormData();
      deleteForm.append("token", TOKEN);
      deleteForm.append("channel", CHANNEL);
      deleteForm.append("ts", ts);

      const res = await fetch("https://" + WORKSPACE + "/api/chat.delete", {
        "headers": {
          "accept": "*/*",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "cookie": COOKIE
        },
        "referrerPolicy": "no-referrer",
        "body": deleteForm,
        "method": "POST"
      });
      const ret = await res.json();
      console.log(ret);
    }
  }

})();
