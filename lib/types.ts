export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Channel {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_image?: string;
  created_at: string;
}

export interface Post {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  media_url: string;
  created_at: string;
}