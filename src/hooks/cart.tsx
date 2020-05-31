import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartProducts = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (cartProducts) setProducts(JSON.parse(cartProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let cart = [];
      const productIndex = products.findIndex(
        cartProduct => product.id === cartProduct.id,
      );
      if (productIndex > -1) {
        cart = products.map(item => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        cart = [...products, { ...product, quantity: 1 }];
      }
      setProducts(cart);
      await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(cart));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      let cart = [];
      const productIndex = products.findIndex(product => product.id === id);
      if (productIndex > -1) {
        cart = products.map(item => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        cart = products;
      }
      setProducts(cart);
      await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(cart));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let cart = [];
      const productIndex = products.findIndex(product => product.id === id);
      if (productIndex > -1) {
        cart = products.map(item => {
          if (item.id === id && item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });
      } else {
        cart = products;
      }
      setProducts(cart);
      await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(cart));
    },
    [products],
  );
  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
