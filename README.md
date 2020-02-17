# CopyPaste.me

**Frictionless sharing between devices** -  
Created by The Social Code

Please help keeping this service free by donating:
https://paypal.me/thesocialcode


## How to run the project


#### Step 1 - Setup your config file
Make a duplicate of `CopyPaste.config.json.dist`, name it `CopyPaste.config.json` and make sure to enter the details as indicate (provided you are planning to use all features described in the table in step 2)  


#### Step 2 - Start the server

In your root directory, start the server script using it's default config:

```
node app/server/CopyPaste.server.js 
```

Of for instance, if you are on a local environment withou SSL and without MongoDB authentication, run: 

```
node app/server/CopyPaste.server.js https=false mongoauthenticate=false 
```

| Argument | Value | comment |
| ------- | ------- | ------- |
| mode | "prod" (default) or "dev" | Set the level of debugging output |
| https | "true" (default) or "false" | Set the protocol |
| mongo | "true" (default) or "false" | Use MongoDB |
| mongoauthenticate | "true" (default) or "false" | Use MongoDB's authentication |

For example:
```
pm2 start app/server/CopyPaste.server.js -- mode=dev https=false
```
(don't forget to `pm2 save` your current pm2 config)