import {
	GetPrompt,
	SetPrompt,
	MessageType,
	RecievedPrompt,
	Prompt,
} from "./types";
import Browser from "webextension-polyfill";

const regexPathName = /\/c\/.+/;
const footprint = "chatgpt-prompt-keeper";
const button = buildButton();
const chatPrompt: Prompt = { chatId: "", prompt: "" };

function addObserver(callback: MutationCallback) {
	const options = { childList: true, subtree: true };

	const observer = new MutationObserver(callback);

	observer.observe(document.body, options);
}
addObserver(addListener);
addListener();

function buildButton() {
	const repeatBtn = document.createElement("button");

	repeatBtn.setAttribute(footprint, "true");
	repeatBtn.innerHTML = `
	<svg
	stroke="currentColor"
	fill="none"
	stroke-width="1.5"
	viewBox="0 0 24 24"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="h-4 w-4 mr-1"
	height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
		<polyline points="1 4 1 10 7 10"></polyline>
		<polyline points="23 20 23 14 17 14"></polyline>
		<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
	</svg>
	`;

	repeatBtn.setAttribute("style", `margin-right: 2rem;`);
	repeatBtn.setAttribute("type", "button");

	repeatBtn.className =
		"hidden absolute p-1 rounded-md text-gray-500 bottom-1.5 md:bottom-2.5 hover:bg-gray-100 " +
		"enabled:dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent " +
		"dark:disabled:hover:bg-transparent right-1 md:right-2 disabled:opacity-40";
	return repeatBtn;
}

async function addListener() {
	if (!regexPathName.test(window.location.pathname)) {
		return;
	}

	chatPrompt.chatId = window.location.pathname.split("/")[2];
	const form = document.querySelector("form");
	const textarea = document.querySelector("textarea");
	const errBtn = document.querySelector("form button.btn-primary");

	if (!!errBtn) {
		const setPrompt: SetPrompt = { message: MessageType.Set, ...chatPrompt };

		Browser.runtime.sendMessage(setPrompt);

		return;
	} else if (!textarea || !form || form.hasAttribute(footprint)) {
		return;
	}

	const getPrompt: GetPrompt = { message: MessageType.Get, ...chatPrompt };

	await Browser.runtime.sendMessage(getPrompt);

	textarea?.parentElement?.appendChild(button);

	button.addEventListener("click", (event) => {
		event.preventDefault();

		textarea.value = chatPrompt.prompt;
		button.classList.add("hidden");
	});

	form?.setAttribute(footprint, "true");
	form?.addEventListener("submit", (event) => {
		event.preventDefault();

		const prompt = textarea?.value ?? "";

		if (prompt.length > 0) localSave(prompt);
	});

	textarea?.addEventListener("keydown", (event) => {
		const prompt = textarea?.value ?? "";
		if (event.code === "Enter" && prompt.length > 0) {
			localSave(prompt);
		}
	});
}

function localSave(prompt: string) {
	chatPrompt.prompt = prompt;
}

Browser.runtime.onMessage.addListener((recieved: RecievedPrompt) => {
	button.classList.remove("hidden");
	chatPrompt.prompt = recieved.prompt;
});
