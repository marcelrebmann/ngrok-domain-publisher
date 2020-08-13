import {Config} from "../interfaces/config.interface";
import {NgrokTunnel} from "../interfaces/ngrok-tunnel.interface";

export abstract class GenericPublisher {

    readonly config: Config;

    protected constructor(config: Config) {
        this.config = config;
    }

    abstract publish(tunnels: NgrokTunnel[]): void;
}
