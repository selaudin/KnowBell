import { DateTime } from "neo4j-driver";

export type docs = {
  KBView_URL: string;
};

export type conversation = {
  prompt: string;
  request: string;
  createdAt?: Date;
  docs: docs[];
};
export type conversationResponse = {
  historyID: number;
  title: string;
  conversations: conversation[];
};
export type createdResponse = {
  statusCode: number;
  response: {};
  hID?: number | null
};
