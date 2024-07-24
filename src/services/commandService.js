import {
	handleImageToSticker,
	handleStickerToImage,
	handleTranscribeAudio,
	handleReset,
	handleGPT,
} from "./commandHandlers.js";

export const handleCommands = async (message, contact) => {
	const commandPrefix = `${process.env.PREFIX}`;
	const messageBody = message.body;

	const commands = {
		fig: handleImageToSticker,
		img: handleStickerToImage,
		escreva: handleTranscribeAudio,
		reset: handleReset,
	};

	const command = Object.keys(commands).find((cmd) => messageBody.startsWith(`${commandPrefix}${cmd}`));

	if (command) {
		await commands[command](message, contact);
	} else if (process.env.GPT) {
		await handleGPT(message);
	}
};
