import {
	Message,
	MessageType,
	SetPrompt,
	RecievedPrompt,
	GetPrompt,
} from "./types";
declare const browser: any;

browser.runtime.onMessage.addListener(async (message: Message) => {
	console.log("Recieved from content-script:", message);

	if (message.message === MessageType.Set) {
		const { chatId, prompt } = message as SetPrompt;

		localStorage.setItem(chatId, prompt);
	} else if (message.message === MessageType.Get) {
		const { chatId } = message as GetPrompt;

		const prompt = localStorage.getItem(chatId);

		if (!prompt) return;

		await browser.tabs.query(
			{ active: true, currentWindow: true },
			async (tabs: any) => {
				const recievedPrompt: RecievedPrompt = {
					message: MessageType.Recieved,
					chatId,
					prompt,
				};
				// Send a message to the content script
				await browser.tabs.sendMessage(tabs[0].id, recievedPrompt);
				localStorage.removeItem(chatId);
			}
		);
	}
});
