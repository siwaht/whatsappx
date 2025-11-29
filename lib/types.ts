export interface EvolutionInstance {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  qrcode?: {
    code: string;
    base64: string;
  };
  number?: string;
  owner?: string;
}

export interface EvolutionMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
    imageMessage?: {
      url: string;
      caption?: string;
    };
    videoMessage?: {
      url: string;
      caption?: string;
    };
    documentMessage?: {
      url: string;
      fileName?: string;
    };
  };
  messageTimestamp: number;
  status?: 'ERROR' | 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ';
}

export interface EvolutionContact {
  id: string;
  pushName?: string;
  profilePicUrl?: string;
  isGroup: boolean;
  isMyContact: boolean;
}

export interface EvolutionGroup {
  id: string;
  subject: string;
  subjectTime: number;
  creation: number;
  owner: string;
  desc?: string;
  descId?: string;
  participants: Array<{
    id: string;
    admin?: 'admin' | 'superadmin' | null;
  }>;
}

export interface EvolutionWebhookEvent {
  event: string;
  instance: string;
  data: any;
  destination?: string;
  date_time: string;
}

export interface SendMessageRequest {
  number: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  fileName?: string;
  caption?: string;
}

export interface InstanceSettings {
  rejectCall?: boolean;
  alwaysOnline?: boolean;
  readMessages?: boolean;
  readStatus?: boolean;
  syncFullHistory?: boolean;
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  events: string[];
  webhookByEvents?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
