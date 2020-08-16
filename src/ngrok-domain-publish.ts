import {Config} from "./interfaces/config.interface";
import {TelegramPublisher} from "./publisher/telegram-publisher";
import {Publishers} from "./publisher/publishers";
import {ConsolePublisher} from "./publisher/console-publisher";
import {GenericPublisher} from "./publisher/generic-publisher";
import {NgrokTunnel} from "./interfaces/ngrok-tunnel.interface";
import * as JsYaml from "js-yaml";
import * as fs from "fs";
import {NgrokConfig} from "./interfaces/ngrok-config.interface";

const exec = require("child_process").exec;
const requestedHandlers = process.argv[3];
const CONFIG: Config = require("../config.json");
const LOG_FILE = CONFIG.logFilePath;
const NGROK_CONFIG = CONFIG.ngrokConfigPath;

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

const loadDefinedTunnels: () => string[] = () => {
    const yamlFileContents = fs.readFileSync(NGROK_CONFIG, "utf-8");
    const ngrokConfig: NgrokConfig = JsYaml.safeLoad(yamlFileContents) as NgrokConfig;
    const tunnels = [];

    if (!ngrokConfig || !ngrokConfig.tunnels) {
        return [];
    }
    const definedTunnelKeys = Object.keys(ngrokConfig.tunnels);

    for (const key of definedTunnelKeys) {
        tunnels.push(key);
        if (ngrokConfig.tunnels[key].proto === "http" && !ngrokConfig.tunnels[key].bind_tls) {
            tunnels.push(`${key} (http)`);
        }
    }
    return tunnels;
};

const publishTunnelDomains = () => {
    const definedTunnelNames = loadDefinedTunnels();
    exec(`cat ${LOG_FILE} | grep -Eo 'msg=\"started tunnel\" obj=tunnels name=(.+) addr=.+ url=((https?|tcp):\/\/.+\.ngrok\.io(:[0-9]+)?)$'`, (error: Error, stdout: string) => {
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

            const isDomainDefined = definedTunnelNames.indexOf(newDomainName) !== -1;

            if (!isDomainDefined) {
                continue;
            }

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
    if (!fs.existsSync(NGROK_CONFIG)) {
        console.log("Ngrok config file for given path does not exist!");
        return;
    }
    if (!fs.existsSync(LOG_FILE)) {
        console.log("Log file for given path does not exist!");
        return;
    }
    buildRequestedPublishers();
    publishTunnelDomains();
}, 3000);
