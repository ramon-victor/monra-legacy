import QRCode from "qrcode";

export let qrCodeDataURL;

export const generateAuthQRCode = async (qr) => {
	generateTerminalQR(qr);
	qrCodeDataURL = await generateImageQR(qr);
};

const generateTerminalQR = (qr) => {
	console.log("\nScan the QR below : ");

	QRCode.toString(qr, {
		type: "terminal",
		small: true,
	})
		.then((url) => {
			console.log(url);
		})
		.catch((err) => {
			console.error(err);
		});
};

const generateImageQR = (qr) => {
	return QRCode.toDataURL(qr);
};
