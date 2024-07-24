import { getClient } from "../config/client.js";
import { processChatWithOpenAI } from "../services/chatService.js";
import { indicateError } from "./errorHandlers.js";

export const isMessageForMe = async (message) => {
	const client = getClient();
	const myId = client.info.wid._serialized;
	if (message.mentionedIds.includes(myId)) return true;
	if (message.body.toLowerCase().includes(process.env.BOT_NAME.toLowerCase())) return true;
	if (message.hasQuotedMsg) {
		const quotedMsg = await message.getQuotedMessage();
		return quotedMsg && quotedMsg.fromMe;
	}
	return false;
};

export const appendMessageToHistory = (history, message) => {
	const filteredHist = history.filter((msg) => msg.id._serialized !== message.id._serialized);
	return filteredHist.concat(message);
};

export const processGPTChat = (chat, message, prompt) => {
	chat.sendStateTyping();
	processChatWithOpenAI(prompt)
		.then(async (response) => {
			if (await isMessageRevoked(message)) return;
			message.reply(response);
		})
		.catch((error) => {
			console.error(error);
			indicateError(message);
		})
		.finally(() => {
			chat.clearState();
		});
};

export const isMessageRevoked = async (message) => {
	const client = getClient();
	const chat = await client.getChatById(message.from);
	const chatMessages = await chat.fetchMessages({});

	return !chatMessages.find((m) => m.id._serialized === message.id._serialized);
};
