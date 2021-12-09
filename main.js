const fetch = require('node-fetch');
const FormData = require('form-data');
const config = require('./config.json');
const CronJob = require('cron').CronJob;

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

const messages = new Set();

const delay = async function(time) {
  return new Promise((resolve, _) => {
    setTimeout(resolve, time);
  });
};

const getMessages = async () => {
  const historyFetchForm = new FormData();
  const now = Date.now();
  historyFetchForm.append("token", TOKEN);
  historyFetchForm.append("channel", CHANNEL);
  historyFetchForm.append("limit", MESSAGE_COUNT + "");
  historyFetchForm.append("oldest", "0");
  historyFetchForm.append("ignore_replies", "false");
  historyFetchForm.append("no_user_profile", "true");
  historyFetchForm.append("include_stories", "true");
  historyFetchForm.append("include_reply_files", "true");
  historyFetchForm.append("latest", (now / 1000) + "");

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
    messages.add(msg.ts);
  }
  console.log("Message queue " + messages.size);
};

const cleanUp = async () => {
  console.log("CLEAN UP START");
  const msgs_to_del = [];
  for (let ts of messages) {
    if ((Date.now() - (ts * 1000)) >= 30 * 60 * 1000) {
      msgs_to_del.push(ts);
    }
  }
  for (let ts of msgs_to_del) {
    await delay(550);

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
    messages.delete(ts);
  }
  console.log("CLEAN UP FINISHED", (new Date()).toLocaleTimeString());
};

const fetchJob = new CronJob('*/5 * * * *', async () => {
  await getMessages();
}, null, true, 'America/Los_Angeles');

const deleteJob = new CronJob('*/2 * * * *', async () => {
  await cleanUp();
}, null, true, 'America/Los_Angeles');

deleteJob.start();
fetchJob.start();
