export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  fullName?: string;
  email?: string;
  bio?: string;
  must_change_password?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  bio?: string;
  created_at: string;
  must_change_password?: boolean;
}

export interface Documentation {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Topic {
  id: string;
  documentation_id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  content: string;
  created_at: string;
}

export interface Database {
  users: User[];
  documentations: Documentation[];
  topics: Topic[];
}

export type AppMode = "editor" | "public";
