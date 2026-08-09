import { createContext, useState, useEffect } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const url = "https://food-delievery-rpr2.onrender.com";

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const fetchFoodList = async () => {
    try {
      const response = await fetch(`${url}/api/food/list`);
      const data = await response.json();
      if (data.success) setFoodList(data.data);
    } catch (error) {
      console.error("Food list error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoodList(); }, []);

  const loadCartData = async (authToken) => {
    try {
      const response = await fetch(`${url}/api/cart/get`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success && data.cart && data.cart.items) {
        const cartObj = {};
        data.cart.items.forEach((item) => {
          const id = item.foodId?._id || item.foodId;
          if (id) cartObj[id] = item.quantity;
        });
        setCartItems(cartObj);
      }
    } catch (error) {
      console.error("Cart load error:", error);
    }
  };

  useEffect(() => {
    if (token) loadCartData(token);
    else setCartItems({});
  }, [token]);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (token) {
      try {
        await fetch(`${url}/api/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ foodId: itemId, quantity: 1 }),
        });
      } catch (error) { console.error("Add to cart error:", error); }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId] -= 1;
      else delete updated[itemId];
      return updated;
    });
    if (token) {
      try {
        await fetch(`${url}/api/cart/remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ foodId: itemId }),
        });
      } catch (error) { console.error("Remove from cart error:", error); }
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = food_list.find((f) => f._id === itemId);
      if (item && cartItems[itemId] > 0) total += item.price * cartItems[itemId];
    }
    return total;
  };

  const clearCart = () => setCartItems({});

  const contextValue = {
    food_list, cartItems, setCartItems,
    addToCart, removeFromCart, getTotalCartAmount, clearCart,
    token, setToken, url, loading,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
