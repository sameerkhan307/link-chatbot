export enum Sender {
  User = 'user',
  Bot = 'model'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export interface ChatSession {
  url: string;
  messages: Message[];
}
