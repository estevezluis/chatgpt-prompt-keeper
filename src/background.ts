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
		port.onMessage.addListener(async (message: Message) => {
			if (message.message === MessageType.Set) {
				await savePrompt(message as SetPrompt);
			} else if (message.message === MessageType.Get) {
				await sendPrompt(message as GetPrompt, port);
			}
		});
	}
});

async function savePrompt({ chatId, prompt }: SetPrompt) {
	await Browser.storage.local.set({ [chatId]: prompt });
}

async function sendPrompt({ chatId }: GetPrompt, port: Browser.Runtime.Port) {
	const result: Record<string, string> = await Browser.storage.local.get(
		chatId
	);

	if (!Object.keys(result).length) return;

	const prompt = result[chatId];
	const recievedPrompt: RecievedPrompt = {
		message: MessageType.Recieved,
		chatId,
		prompt,
	};
	port.postMessage(recievedPrompt);
	await Browser.storage.local.remove(chatId);
}
