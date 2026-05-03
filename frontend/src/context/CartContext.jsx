import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, options = null) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        JSON.stringify(item.options) === JSON.stringify(options)
      );
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && JSON.stringify(item.options) === JSON.stringify(options))
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity, options }];
    });
    setIsSidebarOpen(true);
  };

  const updateQuantity = (id, delta, options = null) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && JSON.stringify(item.options) === JSON.stringify(options)) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id, options = null) => {
    setCart(prev => prev.filter(item => !(item.id === id && JSON.stringify(item.options) === JSON.stringify(options))));
  };

  const clearCart = () => {
    setCart([]);
  };

  const [deliverySettings, setDeliverySettings] = useState({ 
    fee: 100, 
    feePremium: 200, 
    nearbyAreas: '', 
    minFree: 2000 
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.delivery_settings) {
          const s = data.delivery_settings;
          setDeliverySettings({
            fee: parseFloat(s.base_fee || 100),
            feePremium: parseFloat(s.premium_fee || 200),
            nearbyAreas: s.nearby_areas || '',
            minFree: parseFloat(s.free_min || 1000)
          });
        }
      })
      .catch(err => console.error('Error fetching delivery settings:', err));
  }, []);

  const cartTotal = cart.reduce((sum, item) => {
    const itemExtra = item.options?.extraPrice ? parseFloat(item.options.extraPrice) : 0;
    return sum + ((parseFloat(item.price) + itemExtra) * item.quantity);
  }, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Helper function to calculate delivery for a specific area
  const getDeliveryCharge = (area) => {
    if (cartCount === 0 || cartTotal >= deliverySettings.minFree) return 0;
    if (!area) return deliverySettings.fee; // Default to base if not selected
    
    const nearbyList = (deliverySettings.nearbyAreas || '').split(',').map(a => a.trim().toLowerCase());
    const isNearby = nearbyList.includes(area.toLowerCase());
    return isNearby ? deliverySettings.fee : deliverySettings.feePremium;
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart,
      isSidebarOpen, 
      setIsSidebarOpen,
      cartTotal,
      cartCount,
      getDeliveryCharge,
      deliverySettings
    }}>
      {children}
    </CartContext.Provider>
  );
};
