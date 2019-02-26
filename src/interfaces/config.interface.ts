export interface Config {
    logFileDir: string;
    publishers: PublisherConfig;
}

export interface PublisherConfig {
    telegramToken?: string;
    chatId?: string;
    [key: string]: string;
}