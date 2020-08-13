[![Generic badge](https://img.shields.io/badge/ngrok2.x-supported-green.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/ngrok1.x-unsupported-red.svg)](https://shields.io/)

# ngrok-domain-publisher

>A simple script to find and publish the new URL under which your Ngrok tunnels are accessible.<br>
>You can add customized publishers to specify how the new URL should be published.

As you might know, a new public URL is generated every time the Ngrok service restarts (unless you have a paid plan).
E.g. when your Raspberry Pi is rebooting for some reasons.
This means after each restart we need to find out the new URL by looking it up either on the web interface or in the service logs.

This script was written to enable automatic publishing of the URL without any interaction. 

## How to start?
* Download or clone the project:
  ```bash
  # option 1: Download and unzip
  curl -LOk https://github.com/marcelrebmann/ngrok-domain-publisher/archive/v0.2.X.zip
  unzip v0.2.X.zip
  ```
  ```bash
  # option 2: clone from github
  git clone https://github.com/marcelrebmann/ngrok-domain-publisher.git
  ```
* Make sure to have Node.js (>= v10.x) and NPM installed.
* Install dependencies via `npm install`
* Find out in which directory your ngrok.log file is and copy the path.
* Fulfill the entries in `config.json` (especially the path to the log file)
* Build the project via `npm run build`
* To run the script via node, execute `./dist/ngrok-domain-publish.js`

#### Command line args
`-p`  : *The name of the publisher (or multiple publishers) to use (e.g. telegram). Default: Logs to Console*
```
# Logs to telegram.
node ./dist/ngrok-domain-publish.js -p telegram
```
#### Use multiple publishers
To use more than a single publisher, just specify the publisher names comma separated after the `-p` flag:
```
# Logs to console (stdout) AND to telegram.
node ./dist/ngrok-domain-publish.js -p stdout,telegram
```

## Write custom publishers
To add custom logic, just add a new Publisher that extends the `GenericPublisher` Class and register it properly.

1. Implement your new Publisher and save the .ts file in the `publisher` folder.
2. Add your publisher name to `publishers.ts`
   ```typescript
   export enum Publishers {
       Telegram = "telegram",
       Stdout = "stdout"
       // Add your custom publisher key here.
   }
   ```
3. Add your publisher to the selection in `ngrok-domain-publish.ts`:
   ``` typescript
    switch (key) {
        case Publishers.Telegram:
            return new TelegramPublisher(CONFIG);
        case Publishers.Stdout:
            return new ConsolePublisher(CONFIG);
        // Add your custom publisher here.
        default:
            return new ConsolePublisher(CONFIG);
    }
    ```

4. Extend `config.json` and add specific config properties (e.g. Access Tokens,...) for your publisher. 

## Example usage with systemd service
We can publish the new URL automatically after Ngrok Service has restarted.
Just run the compiled `ngrok-domain-publish.js` script in the `ExecStartPost` condition!
```bash
# Example ngrok systemd service file
[Unit]
Description=Ngrok Domain

[Service]
Type=simple
ExecStartPre=/bin/sleep 60 # Optional. If you encounter conflicts on restarts
ExecStart=/home/ubuntu/ngrok http -config=/home/ubuntu/.ngrok2/ngrok.yml 3001
# Publish the new ngrok URL to Telegram by running the compiled ngrok-domain-publish.js via node in ExecStartPost
ExecStartPost=/home/ubuntu/.nvm/versions/node/v10.19.0/bin/node /home/ubuntu/ngrok-domain-publisher/dist/ngrok-domain-publish.js -p telegram
Restart=on-failure
User=ubuntu

[Install]
WantedBy=multi-user.target
```

## Contributing
Feel free to contribute and add Pull Requests with new Publishers which could be useful for others!


## Release Notes

###v0.2.0
- Added support for detecting url changes of multiple ngrok tunnels.
- Added support for using multiple publishers.
- Added compatibility for ngrok2.x
- Dropped support for deprecated ngrok v1
- Minor improvements for documentation

###v0.1.0
- Initial Release.
