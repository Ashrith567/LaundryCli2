import React, { createContext, useState, useContext } from 'react';

type CartItem = {
  expectedKgs: number;
  serviceId: string;
  serviceName: string;
  items: Record<string, number>;
  total: number;
  selectedSlot: string;
};

type Order = {
  id: string;
  serviceName: string;
  totalItems: number;
  totalPrice: number;
  placedAt: string;
  selectedSlot: string;
  status: 'ordered' | 'picked_up' | 'in_progress' | 'delivered' | 'cancelled';
};

type CartContextType = {
  cart: CartItem | null;
  setCart: (cart: CartItem | null) => void;
  resetCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
};

const CartContext = createContext<CartContextType>({
  cart: null,
  setCart: () => {},
  resetCart: () => {},
  orders: [],
  addOrder: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const resetCart = () => {
    setCart(null);
  };

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  return (
    <CartContext.Provider value={{ cart, setCart, resetCart, orders, addOrder }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};