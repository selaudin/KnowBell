import { DateTime } from "neo4j-driver";

export type docs = {
  KBView_URL: string;
  serviceNowNumber: number;
};

export type conversation = {
  prompt: string;
  request: string;
  createdAt: Date;
  docs: docs[];
};
export type conversationResponse = {
  historyID: number;
  title: string;
  conversations: conversation[];
};
