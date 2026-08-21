import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    cartApi.getCart()
      .then(({ cart: nextCart }) => setCart(nextCart || { items: [] }))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false));
  }, [user]);

  async function addItem(foodId, quantity = 1) {
    const result = await cartApi.addCartItem(foodId, quantity);
    setCart(result.cart);
    return result.cart;
  }

  async function updateItem(foodId, quantity) {
    const result = await cartApi.updateCartItem(foodId, quantity);
    setCart(result.cart);
    return result.cart;
  }

  async function removeItem(foodId) {
    const result = await cartApi.removeCartItem(foodId);
    setCart(result.cart);
    return result.cart;
  }

  async function clear() {
    const result = await cartApi.clearCart();
    setCart(result.cart);
    return result.cart;
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ cart, loading, itemCount, addItem, updateItem, removeItem, clear }), [cart, loading, itemCount]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
