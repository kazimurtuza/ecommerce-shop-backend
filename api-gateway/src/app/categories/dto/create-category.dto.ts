export type CreateCategoryDto = {
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status?: 'draft' | 'active' | 'inactive';
  sort_order?: number;
};
