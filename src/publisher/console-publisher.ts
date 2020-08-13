import {GenericPublisher} from "./generic-publisher";
import {Config} from "../interfaces/config.interface";
import {NgrokTunnel} from "../interfaces/ngrok-tunnel.interface";

export class ConsolePublisher extends GenericPublisher {

    constructor(config: Config) {
        super(config);
    }

    publish(tunnels: NgrokTunnel[]) {
        for (const tunnel of tunnels) {
            console.log(`Name: ${tunnel.name}, URL: ${tunnel.url}`);
        }
    }
}