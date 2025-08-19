export interface CartItem {
  id: number;
  qty: number;
}

export interface ProductData {
  id: number;
  name: string;
  price: string;
  image?: string;
  [key: string]: any; // For other product properties we might want to use
}

export interface CartContextType {
  items: CartItem[];
  addItem: (id: number, qty?: number) => void;
  removeItem: (id: number) => void;
  updateItemQty: (id: number, qty: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getCartTotal: (products: ProductData[]) => number;
  isInCart: (id: number) => boolean;
}
