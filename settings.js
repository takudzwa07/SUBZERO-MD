const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    PREFIX: process.env.PREFIX || ",",
    ALIVE_MSG: process.env.ALIVE_MSG || "Hello, I am alive!",
    LANG: process.env.THEME || "SUBZERO-MD",
    HANDLERS: process.env.PREFIX || ".",
    BRANCH: "main",
    STICKER_DATA: process.env.STICKER_DATA || "Subzero;M.D",
    ALWAYS_ONLINE: convertToBool(process.env.ALWAYS_ONLINE) || false,
    AUTO_READ: convertToBool(process.env.AUTO_READ) || false,
    PM_BLOCKER: convertToBool(process.env.PM_BLOCKER) || false,
    READ_MESSAGES: convertToBool(process.env.READ_MESSAGES) || false,
    AUTO_STATUS_READ: convertToBool(process.env.AUTO_STATUS_READ) || false,
    MODE: process.env.MODE || "private",
    AUTO_VOICE: convertToBool(process.env.AUTO_VOICE) || false,
    AUTO_STICKER: convertToBool(process.env.AUTO_STICKER) || false,
    AUTO_REPLY: convertToBool(process.env.AUTO_REPLY) || false,
    ANTI_BOT: convertToBool(process.env.ANTI_BOT) || false,
    ANTI_CALL: convertToBool(process.env.ANTI_CALL) || false,
    ANTI_DELETE: convertToBool(process.env.ANTI_DELETE) || false,
    ANTI_LINK: convertToBool(process.env.ANTI_LINK) || false,
    ANTI_BAD: convertToBool(process.env.ANTI_BAD) || false,
    LOGS: convertToBool(process.env.LOGS) || true,
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || "",
    HEROKU_API_KEY: process.env.HEROKU_API_KEY || "",
};