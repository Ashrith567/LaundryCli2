import React, { createContext, useState, useContext } from 'react';

// Define cart item type
type CartItem = {
  expectedKgs: number;
  serviceId: string;
  serviceName: string;
  items: Record<string, number>;
  total: number;
  selectedSlot: string;
};

// Define the shape of an order
type Order = {
  id: string;
  serviceName: string;
  totalItems: number;
  totalPrice: number;
  placedAt: string; // ISO string for date/time
  selectedSlot: string; // Include selected slot from cart
  status: 'ordered' | 'picked_up' | 'in_progress' | 'delivered' | 'cancelled';
};

// Define cart context type
type CartContextType = {
  cart: CartItem | null;
  setCart: (cart: CartItem | null) => void;
  resetCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
};

// Create cart context
const CartContext = createContext<CartContextType>({
  cart: null,
  setCart: () => {},
  resetCart: () => {},
  orders: [],
  addOrder: () => {},
});

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Reset cart to null
  const resetCart = () => {
    setCart(null);
  };

  // Add a new order to the orders list
  const addOrder = (order: Order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  return (
    <CartContext.Provider value={{ cart, setCart, resetCart, orders, addOrder }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};