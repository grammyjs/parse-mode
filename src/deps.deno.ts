// Temporary local definition for MessageEntity since external deps are not accessible
export interface MessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: any;
  language?: string;
  custom_emoji_id?: string;
}
