import {Config} from "../interfaces/config.interface";
import * as TelegramBot from "node-telegram-bot-api";
import {GenericPublisher} from "./generic-publisher";
import {NgrokTunnel} from "../interfaces/ngrok-tunnel.interface";

export class TelegramPublisher extends GenericPublisher {

    private bot: TelegramBot;
    private readonly chatId: number;

    constructor(config: Config) {
        super(config);
        this.bot = new TelegramBot(config.publishers.telegramToken, {polling: false});
        this.chatId = parseInt(config.publishers.chatId);
    }

    publish(domains: NgrokTunnel[]): void {
        let domainInfo = "";

        for (const domain of domains) {
            domainInfo += `${domain.name}: ${domain.url}\n`;
        }
        this.bot.sendMessage(this.chatId, "<b>Tunnel URLs changed!</b>\nUpdated URLs:\n" + domainInfo, {parse_mode: "HTML"});
    }
}