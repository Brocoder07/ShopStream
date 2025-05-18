import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../api/types';

interface CartState {
  items: CartItem[];
}

interface CartStore extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, quantity = 1) => {
        set((state: CartState) => {
          const existingItem = state.items.find(
            (item: CartItem) => item.productId === product.id
          );

          if (existingItem) {
            const newItems = state.items.map((item: CartItem) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
            console.log('Updated items:', newItems);
            return { items: newItems };
          }

          const newItems = [
            ...state.items,
            { productId: product.id, quantity, product },
          ];
          console.log('Added new item:', newItems);
          return { items: newItems };
        });
      },

      removeItem: (productId: number) => {
        set((state: CartState) => {
          const newItems = state.items.filter((item: CartItem) => item.productId !== productId);
          console.log('Removed item, remaining items:', newItems);
          return { items: newItems };
        });
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity < 1) return;
        
        set((state: CartState) => {
          const newItems = state.items.map((item: CartItem) =>
            item.productId === productId ? { ...item, quantity } : item
          );
          console.log('Updated quantity, items:', newItems);
          return { items: newItems };
        });
      },

      clearCart: () => {
        console.log('Clearing cart');
        set({ items: [] });
      },

      get totalItems() {
        const total = get().items.reduce((total, item) => total + item.quantity, 0);
        console.log('Calculating total items:', total);
        return total;
      },

      get totalAmount() {
        const total = get().items.reduce(
          (total, item) => {
            const itemTotal = (item.product?.price || 0) * item.quantity;
            console.log('Item total:', item.product?.name, itemTotal);
            return total + itemTotal;
          },
          0
        );
        console.log('Calculating total amount:', total);
        return total;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
); 