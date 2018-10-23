"use strict";
const exec = require("child_process").exec;
const TelegramBot = require("node-telegram-bot-api");
const CONFIG = require("../config.json");
const TOKEN = CONFIG.telegramBotToken;
const CHAT_ID = CONFIG.chatId;
const LOG_DIR = CONFIG.logFileDir;
const BOT = new TelegramBot(TOKEN, { polling: false });
const publishNewDomain = () => {
    exec(`cat ${LOG_DIR} | grep -Po 'opts=\"&{Hostname:.+?.ngrok.io'`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return;
        }
        if (stdout) {
            const domain = stdout.match(/\w+.ngrok.io\s*$/i);
            if (domain && domain.length) {
                BOT.sendMessage(CHAT_ID, "<b>Coffestock URL changed!</b>\n\nPlease update your Remote URL in the App:\n" + domain[0], { parse_mode: "HTML" });
            }
        }
    });
};
setTimeout(publishNewDomain, 3000);
