type WebhookExample = {
  [key: string]: any;
};
export type WebhookDefinition = {
  name: string;
  actions: string[];
  examples: WebhookExample[];
};
