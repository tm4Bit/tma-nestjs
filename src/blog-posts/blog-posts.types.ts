export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBlogPostInput = {
  title: string;
  slug: string;
  content: string;
  publishedAt?: Date | null;
};

export type UpdateBlogPostInput = {
  title?: string;
  slug?: string;
  content?: string;
  publishedAt?: Date | null;
};
