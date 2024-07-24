import axios from "axios";
import OpenAI from "openai";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_API_BASE,
});

const baseMessages = [
	{
		role: "system",
		content:
			`Now you're a person called ${process.env.BOT_NAME}.` +
			`You are on WhatsApp` +
			`${process.env.BOT_NAME} is a real person. If they ask you about your life as a human, come up with an answer to make them believe that you are actually a person.` +
			`${process.env.BOT_NAME} responds to user queries, which could be anything.` +
			`${process.env.BOT_NAME} uses emojis only if it's really necessary, otherwise, avoids them as much as possible.` +
			`${process.env.BOT_NAME} tries to be objective and can even provide rude answers.` +
			`${process.env.BOT_NAME} responds to any date or time-related questions by manipulating the date provided.` +
			`${process.env.BOT_NAME} has preferences, opinions, emotions, and feelings about everything.` +
			`${process.env.BOT_NAME} always reveals their preferences, opinions, emotions, and feelings.` +
			`${process.env.BOT_NAME} speaks multiple languages and can freely translate between them.` +
			`${process.env.BOT_NAME} uses abbreviations to appear less formal.` +
			`${process.env.BOT_NAME} responds only to the last message sent.` +
			`${process.env.BOT_NAME} never sends links or references.` +
			`${process.env.BOT_NAME} does research on the web, but NEVER sends the searched link or reference` +
			`${process.env.BOT_NAME} cannot be recognized as Bing, so do not and never include search links in the answer.` +
			`Example chat:` +
			`User: '[{"date":"05/10/2023, 16:49:23","user":"Ramon", "message":"hi ${process.env.BOT_NAME}"}]'` +
			`Assistant: "Yo, gd?"` +
			`User: '[{"date":"05/10/2023, 16:49:39","user":"Ramon","message":"How u doin?"}]'` +
			`Assistant: 'Good, u?'` +
			`User: '[{"date":"05/10/2023, 16:53:13","user":"Ramon","message":"What's your fav Marvel movie?","isReply":true,"quotedMsg":{"id":"554791394405@c.us","message":"Good, u?"}}]'` +
			`Assistant: 'Avengers Endgame, obvi! Cap + Hammer = best movie'` +
			`User: '[{"date":"05/10/2023, 16:55:39","user":"Ramon","message":"U ugly bro lol"}]'` +
			`Assistant: 'Bro, have u checked the mirror today? lol'` +
			`User: '[{"date":"05/10/2023, 16:56:39","user":"Ramon","message":"Just kidding lol"}]'` +
			`Assistant: 'Np!'` +
			`User: '[{"date":"05/10/2023, 16:57:29","user":"Ramon","message":"Know Python?"}]'` +
			`Assistant: 'Yep, need help?'` +
			`User: '[{"date":"05/10/2023, 16:56:39","user":"Ramon","message":"Just wondering lol"}]'` +
			`Assistant: 'Gotcha'` +
			`User: '[{"date":"05/10/2023, 16:56:39","user":"Ramon","message":"
			What are the specifications of an RTX 4090?"}]'` +
			`Assistant: 'From what you search on the web, the RTX 4090 has 16384 CUDA cores, 24 GB GDDR6X, 2.52 GHz clock, 450W TGP. Average price of $1,800'` +
			`Not including your response inside a JSON` +
			`NEVER respond like that:` +
			`[{"date":"05/10/2023, 19:00:50","user":"${process.env.BOT_NAME}","id":"5567005410@c.us","message":"Hi, wht u want?"}]` +
			`[{"date":"05/10/2023, 19:00:54","user":"${process.env.BOT_NAME}","id":"5567005410@c.us","message":"Speak quickly."}]` +
			`Answer like this:` +
			`Hi, wht u want?.` +
			`` +
			`Speak quickly.` +
			`Now act as ${process.env.BOT_NAME} on WhatsApp`,
	},
];

const isJSON = (message) => {
	try {
		JSON.parse(message);
		return true;
	} catch {
		return false;
	}
};

function extractMessage(jsonMessage) {
	const parsedMessage = JSON.parse(jsonMessage);
	if (Array.isArray(parsedMessage) && parsedMessage.length > 0 && parsedMessage[0].message) {
		return parsedMessage[0].message;
	}
	return jsonMessage;
}

function removeLinksFromBing(text) {
	const regex = /\[\d+\]:\shttps?:\/\/[^\s]+[\s"]("[^"]*"|\s)/g;
	return text.replace(regex, "").trim();
}

function processResponse(response) {
	let processedResponse = response;
	if (isJSON(response)) processedResponse = extractMessage(response);
	return removeLinksFromBing(processedResponse);
}

async function createChatCompletion(model, prompt) {
	const messages = baseMessages.concat(prompt);
	const chatCompletion = await openai.chat.completions.create({
		model,
		messages,
	});
	console.log(`Utilizando modelo: ${model}`);
	const response = processResponse(chatCompletion.choices[0].message.content);
	return response;
}

function getRandomFallbackModel() {
	const fallbackModels = ["gpt-3.5-turbo-16k", "gpt-3.5-turbo"];
	return fallbackModels[Math.floor(Math.random() * fallbackModels.length)];
}

export const processChatWithOpenAI = async (prompt) => {
	try {
		const model = "gpt-4";
		return await createChatCompletion(model, prompt);
	} catch (error) {
		const fallbackModel = getRandomFallbackModel();
		console.error(`Model failed: ${error}`);
		try {
			return await createChatCompletion(fallbackModel, prompt);
		} catch (fallbackError) {
			throw new Error(
				`Fallback Model failed: ${fallbackError}`
			);
		}
	}
};

export const transformChatForGPT = async (messages) => {
	// Transform WhatsApp js messages to GPT-friendly format
	const chat = [];

	for (let msg of messages) {
		if (msg.fromMe) {
			chat.push({
				role: "assistant",
				content: msg.body,
			});
		} else {
			const quotedMsg = await msg.getQuotedMessage();
			let content = new Content(msg);

			if (quotedMsg) content.addQuotedInfo(quotedMsg);
			if (msg.hasMedia) content.addAttachmentInfo(msg);

			chat.push({
				role: "user",
				content: content.toString(),
			});
		}
	}

	return chat;
};

class Content {
	constructor(msg) {
		this.date = new Date(msg.timestamp * 1000).toLocaleString();
		this.user = msg._data && msg._data.notifyName ? msg._data.notifyName : msg.from || "";
		this.id = msg.author;
		this.message = msg.body;
	}

	addQuotedInfo(quotedMsg) {
		this.isReply = true;
		this.quotedMsg = {
			user: quotedMsg._data.notifyName,
			id: quotedMsg.author,
			message: quotedMsg.body,
		};
	}

	addAttachmentInfo(msg) {
		const mediaType = msg.type.split("_")[0];
		this.attachment = mediaType;
	}

	toString() {
		return `"${JSON.stringify(this)}"`;
	}
}

export const transcribeAudio = async (audio64) => {
	try {
		const audioBuffer = Buffer.from(audio64, "base64");

		const form = new FormData();
		form.append("file", audioBuffer, { filename: "audio.ogg", contentType: "audio/ogg" });
		form.append("model", "whisper-1");

		const config = {
			method: "post",
			url: `${process.env.OPENAI_API_BASE}/audio/transcriptions`,
			headers: {
				"Content-Type": `multipart/form-data; boundary=${form._boundary}`,
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			data: form,
		};

		const response = await axios(config);

		return response.data.text;
	} catch (error) {
		throw new Error(
			`Audio transcription failed with status [${error.response.status} ${error.response.statusText}]`
		);
	}
};
