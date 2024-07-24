import wwebjs from "whatsapp-web.js";

const { Client } = wwebjs;
let client;

export const initClient = async () => {
	const ffmpegPath = getFfmpegPath();

	client = new Client({
		ffmpeg: ffmpegPath,
		puppeteer: {
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		},
	});
	return client;
};

export const getClient = () => {
	if (!client) throw new Error("Client not initialized");
	return client;
};

function getFfmpegPath() {
	return process.platform === "win32" ? "../../ffmpeg.exe" : "ffmpeg";
}
