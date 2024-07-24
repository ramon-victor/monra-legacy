import moment from 'moment-timezone';
import colors from 'colors';
import { readFile } from 'fs';
import { handleCommands } from './commandService.js';

export const printInitialConsoleText = () => {
    const consoleText = './console.txt';
    readFile(consoleText, 'utf-8', (err, data) => {
        if (err) {
            console.log(
                colors.yellow(
                    `[${moment().tz(process.env.TIMEZONE).format('HH:mm:ss')}] Console Text not found!`
                )
            );
            console.log(
                colors.green(
                    `[${moment().tz(process.env.TIMEZONE).format('HH:mm:ss')}] ${
                        process.env.BOT_NAME
                    } is already!`
                )
            );
        } else {
            console.log(colors.green(data));
            console.log(
                colors.green(
                    `[${moment().tz(process.env.TIMEZONE).format('HH:mm:ss')}] ${
                        process.env.BOT_NAME
                    } is already!`
                )
            );
        }
    });
};

export const handleMessage = async (message) => {
    const contact = await message.getContact();
    const isGroups = message.from.endsWith('@g.us') ? true : false;
    if ((isGroups && process.env.GROUPS) || !isGroups) {
        await handleCommands(message, contact);
    }
};
