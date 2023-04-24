import {
	Message,
	MessageType,
	SetPrompt,
	RecievedPrompt,
	GetPrompt,
} from "./types";
import Browser from "webextension-polyfill";

const url = "https://chat.openai.com/c";
const tabQueryConfig = { active: true, currentWindow: true };

Browser.runtime.onMessage.addListener(async (message: Message) => {
	console.log("Recieved from content-script:", message);

	if (message.message === MessageType.Set) {
		const { chatId, prompt } = message as SetPrompt;

		await Browser.storage.local.set({ [chatId]: prompt });
	} else if (message.message === MessageType.Get) {
		const { chatId } = message as GetPrompt;

		const result: { [key: string]: string } = await Browser.storage.local.get(
			chatId
		);

		if (!result) return;

		const prompt = result[chatId];

		const [tab] = await Browser.tabs.query({
			url: `${url}/${chatId}`,
			...tabQueryConfig,
		});

		if (!!tab?.id) {
			const recievedPrompt: RecievedPrompt = {
				message: MessageType.Recieved,
				chatId,
				prompt,
			};
			await Browser.tabs.sendMessage(tab.id, recievedPrompt);
			await Browser.storage.local.remove(chatId);
		}
	}
});
