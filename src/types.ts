export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  content: string[]; // Array of paragraphs for elegant layout
  category: 'Wellness' | 'Fashion' | 'Travel' | 'Culture' | 'Lifestyle';
  image: string;
  date: string;
  readTime: string;
  author: Author;
  featured?: boolean;
  trending?: boolean;
}

export interface Bookmark {
  articleId: string;
  savedAt: string;
}

export interface NewsletterSubscription {
  email: string;
  preferences: string[];
  subscribedAt: string;
}
