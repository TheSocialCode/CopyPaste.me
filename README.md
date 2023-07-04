# CopyPaste.me

**Frictionless sharing between devices** -  
Created and offered by [The Social Code](https://thesocialcodefoundation.org)

Try it yourself: [CopyPaste.me](https://copypaste.me)

---

Please help keeping this service free:
- Donate: https://paypal.me/thesocialcode
- Become a patron: https://www.patreon.com/thesocialcode

You can also show your support by giving it an upvote on Product Hunt:
https://www.producthunt.com/posts/copypaste-me



# About 

## What does it do?
[CopyPaste.me](https://copypaste.me) helps you when you need to send a password, text snippet or file from one phone, laptop or tablet to another device. No more painstakingly typing in your password character by character, sending yourself pieces of text via email or having to look for a USB stick. As long as you have a browser, you are ready to start sharing data between devices.

## Hoe does it work?
The QR code above is generated specifically for you. Scan it by pointing your phone’s camera at it (most of them have a QR scanner built in) to setup the connection and start sharing! If you don’t have a camera at hand, for instance when you want to connect your laptop to another computer, simply use the 'connect manually' option. Or use the 'invite' option if you like to setup a secure connection with someone else

## What can I use it for?

- **Securely-share passwords** - No more sharing your passwords via WhatsApp, email, text message, or – even worse – writing it down for a colleague, friend or loved one on a piece of paper
- **Easily-share text snippets** - Share snippets of texts, suggestions for messages, a paragraph of an email or document, a piece of code, an error message, etc etc.
- **Effortlessly-share files** - Never again the desperate search for a USB stick or someone from the technical desk to get files from your laptop or phone to a computer you need it on. Also very handy for sharing files or photos with people you’ve just met, but currently don’t have (or want to have) in your contact list. 

## Your data is yours and yours alone
You should be able to share your data from one of your devices to another or share it with a friend, colleague or loved one without big technology giants following your every move. Your data is sent over a secure connection, is end-to-end encrypted and no data is stored on the server.

## How you can help to keep it free
[The Social Code Foundation](https://thesocialcodefoundation.org) wants to offer this privacy-friendly sharing service free to all, but to cover the operational costs it relies on donations by enthusiastic users. For privacy reasons, and because the advertisement business model is broken to the core, the project can’t be funded with ad revenue. For long term sustainability reasons the project doesn’t want to rely on investors: profit and economic growth shouldn't be at the core of every initiative.

- Donate: https://paypal.me/thesocialcode
- Become a patron: https://www.patreon.com/thesocialcode

So if you like this service, please consider supporting the project by chipping in. Thank you very much for making this possible!

# How to run the project


#### Step 1 - Setup your config file
Make a duplicate of `CopyPaste.config.json.dist`, name it `CopyPaste.config.json` and make sure to enter the details as indicate (provided you are planning to use all features described in the table in step 2)  


#### Step 2 - Start the server

In your root directory, start the server script using it's default config:

```
node app/server/CopyPaste.server.js 
```

Or for instance, if you are on a local environment withou SSL and without MongoDB authentication, run: 

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


### Analyzer
```
Local
node app/server/CopyPaste.analyzer.js https=false mongoauthenticate=false

Production
node app/server/CopyPaste.analyzer.js
```

### Monitor (monthly and daily stats)
```
Local
node app/server/CopyPaste.monitor.js period=montlhy https=false mongoauthenticate=false
node app/server/CopyPaste.monitor.js period=daily https=false mongoauthenticate=false

Production
node app/server/CopyPaste.monitor.js
```

*NOTE* - First run the server, then the monitor. In case of issues, try npm update to fix all dependencies