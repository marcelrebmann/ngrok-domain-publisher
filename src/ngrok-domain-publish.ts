import {Config} from "./interfaces/config.interface";
import {TelegramPublisher} from "./publisher/telegram-publisher";
import {Publishers} from "./publisher/publishers";
import {ConsolePublisher} from "./publisher/console-publisher";
import {GenericPublisher} from "./publisher/generic-publisher";

const exec = require("child_process").exec;
const handler = process.argv[3];
const CONFIG: Config = require("../config.json");
const LOG_DIR = CONFIG.logFileDir;

let publisher: GenericPublisher;

switch (handler) {
    case Publishers.Telegram:
        publisher = new TelegramPublisher(CONFIG);
        break;
    default:
        publisher = new ConsolePublisher(CONFIG);
}

const publishNewDomain = () => {
    exec(`cat ${LOG_DIR} | grep -Po 'opts=\"&{Hostname:.+?.ngrok.io'`, (error: Error, stdout: string) => {
        if (error) {
            console.log(error);
            return;
        }
        if (stdout) {
            const domain = stdout.match(/\w+.ngrok.io\s*$/i);
            if (domain && domain.length) {
                const url = domain[0];
                publisher.publish(url);
                return;
            }
        }
    });
};

setTimeout(publishNewDomain, 3000);
