# Discordbot

Discord Music and verify bot using DISCORD.JS V.14

## Features
- 🎵 Music Player
- ✅ Verify Bot
- 🖼️ Image Searcher
- 🧮 Calculator
- 🔊 SoundBoard
- 🔠 Translate
- 🗳️ Poll create
- ♈ Horoscope (Only Thai)
- 💬 Chatbot(Only support Thai and English)

## Setup
1. Create a folder on your computer, then type the following console command to clone this repository.
```bash
git clone https://github.com/Yamami1221/Discordbot
```

2. Create a Discord Application and name it.

![bot create](https://i.imgur.com/luHPTGL.png "Step 2")

3. Create `.env` in main folder and `horodata.json`,`data.json` in data folder and fill the required values. **Do not show anyone these!**

For .env
```bash
TOKEN='Your_DISCORD_TOKEN'
CSE_ID='YOUR_GOOGLE_CDE_ID' //to use image search
GOOGLE_API_KEY='YOUR_GOOGLE_CUSTOM_SEARCH_API'
```
For data.json and horodata.js
```bash
"[[]]"
```

4. Install Node.js v18.13.0 or higher by selecting the **Current** tab, and then **"OS Name" Installer**. [Click here](https://nodejs.org/en/download/current/) for the download page.

![nodejs](https://i.imgur.com/mtJcz5E.png "Step 4")

5. Install all of the required NPM modules.
```bash
npm install
```

6. Deploy commands and Start the bot.
```bash
node run deploy
```

## Usage

To create commands, you need to run the following command in the console:
```bash
npm run deploycommands
```

These will create a new set of commands in the server.

> NOTE: You may need to wait an hour for the commands to create. 200 Command Creates per day is the limit.

## 📚 Guides
- [Creating commands](https://discordjs.guide/creating-your-bot/slash-commands.html)
- [Replying to Slash Commands](https://discordjs.guide/slash-commands/response-methods.html)
- [Handling Commands](https://discordjs.guide/creating-your-bot/event-handling.html)
