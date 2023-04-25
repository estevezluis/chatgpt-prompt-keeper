import {
	Message,
	MessageType,
	SetPrompt,
	RecievedPrompt,
	GetPrompt,
} from "./types";
import Browser from "webextension-polyfill";

Browser.runtime.onConnect.addListener((port: Browser.Runtime.Port) => {
	if (port.name === "chatgpt-prompt-keeper") {
		port.onMessage.addListener((message: Message) => {
			if (message.message === MessageType.Set) {
				savePrompt(message as SetPrompt);
			} else if (message.message === MessageType.Get) {
				sendPrompt(message as GetPrompt, port);
			}
		});
	}
});

async function savePrompt({ chatId, prompt }: SetPrompt) {
	await Browser.storage.local.set({ [chatId]: prompt });
}

async function sendPrompt(message: GetPrompt, port: Browser.Runtime.Port) {
	const { chatId } = message as GetPrompt;

	const result: { [key: string]: string } = await Browser.storage.local.get(
		chatId
	);

	if (!result || !result[chatId]) return;

	const prompt = result[chatId];
	const recievedPrompt: RecievedPrompt = {
		message: MessageType.Recieved,
		chatId,
		prompt,
	};
	port.postMessage(recievedPrompt);
	await Browser.storage.local.remove(chatId);
}
