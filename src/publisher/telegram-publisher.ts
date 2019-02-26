import {Config} from "../interfaces/config.interface";
import * as TelegramBot from "node-telegram-bot-api";
import {GenericPublisher} from "./generic-publisher";

export class TelegramPublisher extends GenericPublisher {

    bot: TelegramBot;
    chatId: number;

    constructor(config: Config) {
        super(config);
        this.bot = new TelegramBot(config.publishers.telegramToken, {polling: false});
        this.chatId = parseInt(config.publishers.chatId);
    }

    publish(url: string) {
        this.bot.sendMessage(this.chatId, "<b>URL changed!</b>\n\nPlease update your Remote URL in the App:\n" + url, {parse_mode: "HTML"});
    }
}