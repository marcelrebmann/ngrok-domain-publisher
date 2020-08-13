import {Config} from "./interfaces/config.interface";
import {TelegramPublisher} from "./publisher/telegram-publisher";
import {Publishers} from "./publisher/publishers";
import {ConsolePublisher} from "./publisher/console-publisher";
import {GenericPublisher} from "./publisher/generic-publisher";
import {NgrokTunnel} from "./interfaces/ngrok-tunnel.interface";

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

const publishTunnelDomains = () => {
    exec(`cat ${LOG_DIR} | grep -Po 'obj=tunnels name=(.+) addr=.+ url=(https?:\/\/.+\.ngrok\.io)$'`, (error: Error, stdout: string) => {
        if (error) {
            console.log(error);
            return;
        }
        if (!stdout) {
            console.log("No tunnels found.");
            return;
        }
        console.log(stdout);
        const lines = stdout.split(/\r?\n/);
        const tunnels: NgrokTunnel[] = [];

        for (const line of lines) {
            const match = line.match(/name="?([^"]+)"? .+ url=https?:\/\/(.+\.ngrok\.io)/);

            if (!match || !match.length) {
                continue;
            }
            const newDomainName = match[1].replace(" (http)", "");
            const newDomainUrl = match[2];

            if (tunnels.find(domain => domain.url === newDomainUrl)) {
                return;
            }
            tunnels.push({name: newDomainName, url: newDomainUrl});
        }

        if (!tunnels || !tunnels.length) {
            console.log("No tunnels found.");
            return;
        }
        publisher.publish(tunnels);
        return;
    });
};

setTimeout(publishTunnelDomains, 3000);
