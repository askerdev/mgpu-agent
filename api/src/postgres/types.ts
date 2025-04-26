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
