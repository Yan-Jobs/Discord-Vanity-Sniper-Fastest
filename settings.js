"use strict";
const fetch = require("node-fetch");
const config = require("./config");

const SNIPER_GUILD_ID = config.GUILDID;
const SNIPER_SELF_TOKEN = config.TOKEN1;
const URL_SNIPER_SELF_TOKEN = config.TOKEN2;
const webhookURL = config.WEBHOOK;

async function sendWebhook(webhookURL, content, username) {
    await fetch(webhookURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content,
            username,
        }),
    });
}
const WEBHOOKS = {
    SUCCESS: async (content) => {
        const avatarURL = "https://img.imgyukle.com/2023/07/28/r1BPrY.jpeg"; 
        await sendWebhook(webhookURL, content, "cakal url", avatarURL);
    },
    INFO: async (content) => {
        const avatarURL = "URL_YOUR_AVATAR_INFO"; 
        await sendWebhook(webhookURL, content, "cakal url", avatarURL);
    },
    FAIL: async (content) => {
        const avatarURL = "https://img.imgyukle.com/2023/07/28/r1sAbq.jpeg"; 
        await sendWebhook(webhookURL, content, "cakal url", avatarURL);
    },
};


module.exports = {
    SNIPER_GUILD_ID,
    SNIPER_SELF_TOKEN,
    URL_SNIPER_SELF_TOKEN,
    WEBHOOKS,
};
