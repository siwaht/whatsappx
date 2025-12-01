// Evolution API v2 TypeScript Definitions

// ============= Instance Types =============
export interface Instance {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  qrcode?: {
    code: string;
    base64: string;
  };
  number?: string;
  profileName?: string;
  profilePicture?: string;
  webhook?: WebhookConfig;
  settings?: InstanceSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InstanceSettings {
  rejectCall: boolean;
  msgCall?: string;
  groupsIgnore: boolean;
  alwaysOnline: boolean;
  readMessages: boolean;
  readStatus: boolean;
  syncFullHistory: boolean;
}

export interface CreateInstanceDto {
  instanceName: string;
  token?: string;
  number?: string;
  qrcode?: boolean;
  integration?: string;
  webhook?: WebhookConfig;
  settings?: Partial<InstanceSettings>;
}

// ============= Message Types =============
export interface Message {
  id: string;
  key: MessageKey;
  pushName?: string;
  message?: MessageContent;
  messageType: MessageType;
  messageTimestamp: number;
  status?: MessageStatus;
  fromMe: boolean;
  participant?: string;
  source?: string;
}

export interface MessageKey {
  remoteJid: string;
  fromMe: boolean;
  id: string;
  participant?: string;
}

export type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'ERROR';

export type MessageType =
  | 'conversation'
  | 'extendedTextMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'audioMessage'
  | 'documentMessage'
  | 'stickerMessage'
  | 'locationMessage'
  | 'contactMessage'
  | 'contactsArrayMessage'
  | 'pollCreationMessage'
  | 'listMessage'
  | 'buttonsMessage'
  | 'reactionMessage';

export interface MessageContent {
  conversation?: string;
  extendedTextMessage?: ExtendedTextMessage;
  imageMessage?: MediaMessage;
  videoMessage?: MediaMessage;
  audioMessage?: AudioMessage;
  documentMessage?: DocumentMessage;
  stickerMessage?: MediaMessage;
  locationMessage?: LocationMessage;
  contactMessage?: ContactMessage;
  contactsArrayMessage?: ContactsArrayMessage;
  pollCreationMessage?: PollMessage;
  listMessage?: ListMessage;
  buttonsMessage?: ButtonsMessage;
  reactionMessage?: ReactionMessage;
}

export interface ExtendedTextMessage {
  text: string;
  contextInfo?: ContextInfo;
  matchedText?: string;
  canonicalUrl?: string;
  description?: string;
  title?: string;
}

export interface MediaMessage {
  url?: string;
  mimetype?: string;
  caption?: string;
  fileSha256?: string;
  fileLength?: number;
  height?: number;
  width?: number;
  mediaKey?: string;
  fileEncSha256?: string;
  directPath?: string;
  mediaKeyTimestamp?: number;
  jpegThumbnail?: string;
}

export interface AudioMessage extends MediaMessage {
  seconds?: number;
  ptt?: boolean;
  waveform?: Uint8Array;
}

export interface DocumentMessage extends MediaMessage {
  fileName?: string;
  pageCount?: number;
  fileEncSha256?: string;
}

export interface LocationMessage {
  degreesLatitude: number;
  degreesLongitude: number;
  name?: string;
  address?: string;
  url?: string;
  jpegThumbnail?: string;
}

export interface ContactMessage {
  displayName: string;
  vcard: string;
}

export interface ContactsArrayMessage {
  displayName: string;
  contacts: ContactMessage[];
}

export interface PollMessage {
  name: string;
  options: Array<{ optionName: string }>;
  selectableOptionsCount: number;
}

export interface ListMessage {
  title: string;
  description?: string;
  buttonText: string;
  footerText?: string;
  sections: ListSection[];
  listType?: number;
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface ListRow {
  title: string;
  description?: string;
  rowId: string;
}

export interface ButtonsMessage {
  contentText: string;
  footerText?: string;
  buttons: Button[];
  headerType?: number;
}

export interface Button {
  buttonId: string;
  buttonText: { displayText: string };
  type: number;
}

export interface ReactionMessage {
  key: MessageKey;
  text: string;
}

export interface ContextInfo {
  stanzaId?: string;
  participant?: string;
  quotedMessage?: MessageContent;
  remoteJid?: string;
  mentionedJid?: string[];
  conversionSource?: string;
  conversionData?: Uint8Array;
  conversionDelaySeconds?: number;
  forwardingScore?: number;
  isForwarded?: boolean;
  ephemeralExpiration?: number;
  ephemeralSettingTimestamp?: number;
}

// ============= Send Message DTOs =============
export interface SendTextDto {
  number: string;
  text: string;
  delay?: number;
  quoted?: MessageKey;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
  linkPreview?: boolean;
}

export interface SendMediaDto {
  number: string;
  mediatype: 'image' | 'video' | 'audio' | 'document';
  media: string; // URL or base64
  caption?: string;
  fileName?: string;
  delay?: number;
  quoted?: MessageKey;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
}

export interface SendLocationDto {
  number: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface SendContactDto {
  number: string;
  contact: string[];
}

export interface SendPollDto {
  number: string;
  name: string;
  selectableCount: number;
  values: string[];
}

export interface SendListDto {
  number: string;
  title: string;
  description?: string;
  buttonText: string;
  footerText?: string;
  sections: ListSection[];
}

// ============= Chat & Conversation Types =============
export interface Chat {
  id: string;
  conversationTimestamp: number;
  unreadCount: number;
  archived?: boolean;
  pinned?: boolean;
  muteEndTime?: number;
  name?: string;
  notSpam?: boolean;
  ephemeralExpiration?: number;
  ephemeralSettingTimestamp?: number;
  endOfHistoryTransfer?: boolean;
  endOfHistoryTransferType?: number;
  contactPrimaryIdentityKey?: Uint8Array;
  timestampMs?: number;
  mediaVisibility?: number;
  tcTokenSenderTimestamp?: number;
  suspended?: boolean;
  terminated?: boolean;
}

export interface Conversation {
  id: string;
  remoteJid: string;
  name: string;
  profilePicture?: string;
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  timestamp: Date;
  pinned?: boolean;
  archived?: boolean;
  muted?: boolean;
}

// ============= Contact Types =============
export interface Contact {
  id: string;
  remoteJid: string;
  pushName?: string;
  profilePictureUrl?: string;
  isGroup: boolean;
  isMyContact?: boolean;
  isWAContact?: boolean;
  labels?: string[];
  notify?: string;
  verifiedName?: string;
  imgUrl?: string;
}

export interface CheckNumberDto {
  numbers: string[];
}

export interface CheckNumberResponse {
  exists: boolean;
  jid: string;
  numberExists?: boolean;
}

// ============= Group Types =============
export interface Group {
  id: string;
  subject: string;
  subjectOwner?: string;
  subjectTime?: number;
  description?: string;
  descId?: string;
  descOwner?: string;
  descTime?: number;
  owner: string;
  participants: GroupParticipant[];
  creation: number;
  pictureUrl?: string;
  size: number;
  restrict?: boolean;
  announce?: boolean;
  ephemeralDuration?: number;
  inviteCode?: string;
}

export interface GroupParticipant {
  id: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface CreateGroupDto {
  subject: string;
  description?: string;
  participants: string[];
  profilePicture?: string;
}

export interface UpdateGroupDto {
  subject?: string;
  description?: string;
  profilePicture?: string;
}

export interface UpdateGroupParticipantsDto {
  action: 'add' | 'remove' | 'promote' | 'demote';
  participants: string[];
}

// ============= Webhook Types =============
export interface WebhookConfig {
  enabled: boolean;
  url: string;
  webhook_by_events?: boolean;
  webhook_base64?: boolean;
  events?: WebhookEvent[];
}

export type WebhookEvent =
  | 'APPLICATION_STARTUP'
  | 'QRCODE_UPDATED'
  | 'CONNECTION_UPDATE'
  | 'MESSAGES_SET'
  | 'MESSAGES_UPSERT'
  | 'MESSAGES_UPDATE'
  | 'MESSAGES_DELETE'
  | 'SEND_MESSAGE'
  | 'CONTACTS_SET'
  | 'CONTACTS_UPSERT'
  | 'CONTACTS_UPDATE'
  | 'PRESENCE_UPDATE'
  | 'CHATS_SET'
  | 'CHATS_UPDATE'
  | 'CHATS_UPSERT'
  | 'CHATS_DELETE'
  | 'GROUPS_UPSERT'
  | 'GROUPS_UPDATE'
  | 'GROUP_PARTICIPANTS_UPDATE'
  | 'NEW_TOKEN'
  | 'TYPEBOT_START'
  | 'TYPEBOT_CHANGE_STATUS';

export interface WebhookPayload {
  event: WebhookEvent;
  instance: string;
  data: any;
  destination?: string;
  date_time: string;
  sender: string;
  server_url: string;
  apikey: string;
}

// ============= Presence Types =============
export type PresenceType = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused';

export interface PresenceDto {
  presence: PresenceType;
}

// ============= Dashboard Stats Types =============
export interface DashboardStats {
  totalMessages: {
    sent: number;
    received: number;
    failed: number;
  };
  activeConversations: number;
  totalContacts: number;
  totalGroups: number;
  messagesByDay: Array<{
    date: string;
    sent: number;
    received: number;
  }>;
  messagesByHour: Array<{
    hour: number;
    count: number;
  }>;
  topContacts: Array<{
    name: string;
    phone: string;
    messageCount: number;
  }>;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  instanceHealth: {
    uptime: string;
    lastActivity: Date;
  };
}

// ============= Integration Types =============
export interface TypebotConfig {
  enabled: boolean;
  url: string;
  typebot: string;
  expire?: number;
  keyword_finish?: string;
  delay_message?: number;
  unknown_message?: string;
  listening_from_me?: boolean;
}

export interface ChatwootConfig {
  enabled: boolean;
  account_id: string;
  token: string;
  url: string;
  sign_msg?: boolean;
  reopen_conversation?: boolean;
  conversation_pending?: boolean;
  name_inbox?: string;
  merge_brazil_contacts?: boolean;
  import_contacts?: boolean;
  import_messages?: boolean;
  days_limit_import_messages?: number;
}

// ============= API Response Types =============
export interface ApiResponse<T = any> {
  status: number;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============= Connection Types =============
export interface ConnectionState {
  instance: string;
  state: 'open' | 'close' | 'connecting';
}

export interface QRCode {
  code: string;
  base64: string;
  instance: string;
}

// ============= Error Types =============
export interface EvolutionError {
  status: number;
  message: string;
  error?: string;
  details?: any;
}
