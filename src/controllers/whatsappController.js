import { generateAuthQRCode } from "../services/QRCodeService.js";
import { handleMessage, printInitialConsoleText } from "../services/whatsappService.js";
import { initClient } from "../config/client.js";

const startClient = async () => {
	const client = await initClient();

	client.on("qr", async (qr) => {
		generateAuthQRCode(qr);
	});

	client.on("ready", () => {
		console.clear();
		printInitialConsoleText();
	});

	client.on("message", handleMessage);

	client.initialize();
};

export default startClient;
