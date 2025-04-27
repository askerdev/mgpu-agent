export interface Session {
  id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

export interface User {
  id: string;
  vk_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  email?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Chat {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: "assistant" | "user";
  created_at: Date;
}
