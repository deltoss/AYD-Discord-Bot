# Discord bot

A bot that:

- Lets you create & join groups.
- Talks back to YogaDelt cultists to convert them to pure innocent AYD citizens.

> Note 📜
>
> This bot uses `NeDB` as the data store, which is basically a `NoSQL` equivalent of `SQLite`.
>
> This bot uses the unofficial [nedb-async](https://www.npmjs.com/package/nedb-async) package instead of the official [nedb](https://www.npmjs.com/search?q=neDB) package for `async/await` support, which makes the codebase cleaner & easier to understand.

## Getting started

Setup a discord application/bot by following Step 1 [here](https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js).

Copy `.env.template` and name it `.env`, replace the relevant data in there with your application credentials.

Invite your bot to a server with this link, replace `${DISCORD_CLIENT_ID}` with the client ID (AKA Application ID), which can be obtained when you created your discord application.

```text
https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=2048&scope=bot%20applications.commands
```

> Developer Tip 💡
>
> The url has `permissions=2048`, which means it asks for the below permissions for the bot:
>
> - Send Messages

Run the following commands in this project:

```bash
npm install
npm start
```

Use the bot by typing in `/`, and then clicking on the bot to see what commands are available.

![Demonstration](./Demonstration.gif)
