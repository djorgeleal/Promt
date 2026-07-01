export interface Prompt {
  id?: string;
  title: string;
  instructions: string;
  description: string;
  category: string;
  model: string;
  imageUrl?: string;
  authorId: string;
  authorEmail: string;
  createdAt: any; // Can be Firebase Timestamp or ISO string
  isCommunity?: boolean;
}

export interface Favorite {
  id?: string;
  userId: string;
  promptId: string;
  createdAt: any;
}

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
  icon: string;
}
