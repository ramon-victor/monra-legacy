import { getClient } from '../config/client.js';  
import { transformChatForGPT, transcribeAudio } from "./chatService.js";
import { indicateError, indicateSuccess } from "../utils/errorHandlers.js";
import { isMessageForMe, appendMessageToHistory, processGPTChat } from "../utils/messageUtils.js";

export const handleImageToSticker = async (message, contact) => {
	let mediaMessage = message;
	message.react("⏳");

	if (message.hasQuotedMsg) {
		mediaMessage = await message.getQuotedMessage();
	}

	if (mediaMessage.hasMedia) {
		try {
			const media = await mediaMessage.downloadMedia();
			const client = getClient();
			
			await client.sendMessage(message.from, media, {
				sendMediaAsSticker: true,
				stickerName: `Criada por ${contact.pushname}`,
				stickerAuthor: `Bot by ${process.env.AUTHOR}`,
			});
			indicateSuccess(message);
		} catch {
			indicateError(message);
		}
	} else {
		indicateError(message, "❌ Não é uma imagem.");
	}
};

export const handleStickerToImage = async (message) => {
	const quotedMsg = await message.getQuotedMessage();

	if (message.hasQuotedMsg && quotedMsg.hasMedia) {
		message.react("⏳");
		try {
			const media = await quotedMsg.downloadMedia();
			const client = getClient();

			await client.sendMessage(message.from, media);
			indicateSuccess(message);
		} catch {
			indicateError(message);
		}
	} else {
		indicateError(message, "❌ Não é uma figurinha.");
	}
};

export const handleTranscribeAudio = async (message) => {
	const quotedMsg = await message.getQuotedMessage();
	const chat = await message.getChat();

	if (message.hasQuotedMsg && quotedMsg.hasMedia) {
		message.react("⏳");
		try {
			const media = await quotedMsg.downloadMedia();
			chat.sendStateTyping();

			transcribeAudio(media.data)
				.then((res) => {
					const response = `No áudio foi dito: \n\n${res}`;
					quotedMsg.reply(response);
					indicateSuccess(message);
				})
				.catch((error) => {
					console.error(error);
					indicateError(message);
				})
				.finally(() => {
					chat.clearState();
				});
		} catch {
			indicateError(message);
		}
	} else {
		indicateError(message, "❌ Não é um audio.");
	}
};

export const handleReset = async (message) => {
	const chat = await message.getChat();

	if (chat) {
		chat.clearMessages()
			.then(() => {
				chat.sendMessage("Resetado ✅");
			})
			.catch(() => {
				indicateError(message);
			});
	}
};

export const handleGPT = async (message) => {
	const chat = await message.getChat();

	if (chat.isGroup && !(await isMessageForMe(message))) return;

	const hist = await chat.fetchMessages({ limit: 15 });
	const messages = appendMessageToHistory(hist, message);

	const prompt = await transformChatForGPT(messages);
	if (prompt) processGPTChat(chat, message, prompt);
};
