export interface StorageLocationItem {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  type: string;
  parentId: string | null;
  fullPath: string;
  depth: number;
  children?: StorageLocationItem[];
  _count?: {
    products: number;
    children: number;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  _count?: {
    products: number;
  };
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  quantity: number;
  minQuantity: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  categoryId: string | null;
  locationId: string | null;
  category?: CategoryItem | null;
  location?: StorageLocationItem | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
