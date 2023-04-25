/* eslint @typescript-eslint/consistent-type-definitions: ["error", "type"] */
export enum MessageType {
	Get = "GET",
	Set = "SET",
	Recieved = "RECIEVED",
}
export type Message = {
	message: MessageType;
};

export type Prompt = {
	chatId: string;
	prompt: string;
};

export type SetPrompt = Message &
	Prompt & {
		message: MessageType.Set;
	};

export type GetPrompt = Message & {
	message: MessageType.Get;
	chatId: string;
};

export type RecievedPrompt = Message &
	Prompt & {
		message: MessageType.Recieved;
	};
