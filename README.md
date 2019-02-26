# ngrok-domain-publisher

>A simple script to find and publish the new URL under which your machine is accessible via Ngrok.<br>
>You can add customized handler functions to specify how the new URL should be published.

As you might know, a new public URL is generated every time, the Ngrok service restarts (unless you have a paid plan).
(e.g. when your Raspberry Pi is rebooting for some reasons)
This means after each restart we need to find out the new URL by looking it up either in the Web interface or in the service logs.

This script was written to enable automatic publishing of the URL without any interaction. 

## How to start?
* Make sure to have Node.js (v10.x) and NPM installed.
* Install dependencies via `npm install`
* Find out in which directory your ngrok.log file is and copy the path.
* Fulfill the entries in `config.json` (especially the path to the log file)
* Build the project via `npm run build`
* To run the script via node ./ngrok-domain-publish.js -p <PUBLISHER_NAME>

#### Command line args
`-p`  : *The name of the publisher to use (e.g. telegram). Default: Logs to Console*

## Writing Custom Handlers
To add custom logic, just add a new Publisher that extends the `GenericPublisher` Class and register it properly.

1. Implement your new Publisher and save the file in the `publishers` folder.
2. Add your publisher name to `publishers.ts`
3. Add a new case in `ngrok-domain-publisher.ts`:
   ``` typescript
    switch (handler) {
        case Publishers.Telegram:
            publisher = new TelegramPublisher(CONFIG);
            break;
        // Adding your Custom Handler
        case Publishers.CUSTOM_HANDLER:
            publisher = new CUSTOM_HANDLER(CONFIG);
            break;
        default:
            publisher = new ConsolePublisher(CONFIG);
    }
    ```

4. Add specific config properties (e.g. Access Tokens,...) to your `config.json`

## Example use with systemd service
We can publish the new URL automatically after Ngrok Service has restarted.
Just run the script in the `ExecStartPost` condition!
```
// ngrok systemd service file
[Unit]
Description=Ngrok Domain
Reqiures=coffeestock.service

[Service]
Type=simple
ExecStart=/home/ubuntu/ngrok http -config=/home/ubuntu/.ngrok2/ngrok.yml 3001
ExecStartPost=/home/ubuntu/.nvm/versions/node/v8.12.0/bin/node /home/ubuntu/ngrok-domain-publisher/dist/ngrok-domain-publish.js
Restart=on-failure
User=ubuntu

[Install]
WantedBy=multi-user.target
```

## Contributing
Feel free to contribute add Pull Requests with new Handlers/Services which could be useful for others!
