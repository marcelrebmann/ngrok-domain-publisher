import {GenericPublisher} from "./generic-publisher";
import {Config} from "../interfaces/config.interface";

export class ConsolePublisher extends GenericPublisher {

    constructor(config: Config) {
        super(config);
    }

    publish(domain: string) {
        console.log(domain);
    }
}