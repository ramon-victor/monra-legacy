import { isMessageRevoked } from "./messageUtils.js";

export const indicateSuccess = async (message) => {
	if (await isMessageRevoked(message)) return;

	message.react("✅");
};

export const indicateError = async (message, errorText = null) => {
	if (await isMessageRevoked(message)) return;

	if (errorText) message.reply(errorText);
	message.react("❌");
};
