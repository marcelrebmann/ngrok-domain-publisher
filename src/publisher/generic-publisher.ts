import {Config} from "../interfaces/config.interface";

export abstract class GenericPublisher {

    readonly config: Config;

    protected constructor(config: Config) {
        this.config = config;
    }

    abstract publish(message: string): void;
}
