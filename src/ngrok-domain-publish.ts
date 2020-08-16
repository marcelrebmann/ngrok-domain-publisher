import {Config} from "./interfaces/config.interface";
import {TelegramPublisher} from "./publisher/telegram-publisher";
import {Publishers} from "./publisher/publishers";
import {ConsolePublisher} from "./publisher/console-publisher";
import {GenericPublisher} from "./publisher/generic-publisher";
import {NgrokTunnel} from "./interfaces/ngrok-tunnel.interface";

const exec = require("child_process").exec;
const requestedHandlers = process.argv[3];
const CONFIG: Config = require("../config.json");
const LOG_DIR = CONFIG.logFileDir;

const publishers: GenericPublisher[] = [];

const buildRequestedPublishers = () => {
    if (!requestedHandlers) {
        publishers.push(createPublisher());
        return;
    }
    const handlers = requestedHandlers.split(",");

    for (const handler of handlers) {
        publishers.push(createPublisher(handler));
    }
};

const createPublisher: (key?: string) => GenericPublisher = (key: string) => {
    switch (key) {
        case Publishers.Telegram:
            return new TelegramPublisher(CONFIG);
        case Publishers.Stdout:
            return new ConsolePublisher(CONFIG);
        default:
            return new ConsolePublisher(CONFIG);
    }
};

const publishTunnelDomains = () => {
    exec(`cat ${LOG_DIR} | grep -Eo 'msg=\"started tunnel\" obj=tunnels name=(.+) addr=.+ url=((https?|tcp):\/\/.+\.ngrok\.io(:[0-9]+)?)$'`, (error: Error, stdout: string) => {
        if (error) {
            console.log(error);
            return;
        }
        if (!stdout) {
            console.log("No tunnels found.");
            return;
        }
        const lines = stdout.split(/\r?\n/);
        const tunnels: NgrokTunnel[] = [];

        for (const line of lines) {
            const match = line.match(/name="?([^"]+)"? .+ url=((https?|tcp):\/\/.+\.ngrok\.io(:[0-9]+)?)$/);

            if (!match || !match.length) {
                continue;
            }
            const newDomainName = match[1];
            const newDomainUrl = match[2];

            const tunnelIndex = tunnels.findIndex(tunnel => tunnel.name === newDomainName);
            const doesTunnelExist = tunnelIndex !== -1;

            // If tunnel name exists, override and update the url.
            if (doesTunnelExist) {
                tunnels[tunnelIndex] = {
                    name: newDomainName,
                    url: newDomainUrl
                };
                continue;
            }
            tunnels.push({name: newDomainName, url: newDomainUrl});
        }

        if (!tunnels || !tunnels.length) {
            console.log("No tunnels found.");
            return;
        }
        publishers.forEach(publisher => publisher.publish(tunnels));
        return;
    });
};

setTimeout(() => {
    buildRequestedPublishers();
    publishTunnelDomains();
}, 3000);
