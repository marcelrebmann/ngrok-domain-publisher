export interface Config {
    logFilePath: string;
    ngrokConfigPath: string;
    publishers: PublisherConfig;
}

export interface PublisherConfig {
    telegramToken?: string;
    chatId?: string;
    [key: string]: string;
}