import Cart from "../models/cart.js";

//  Add to Cart
export const addToCart = async (req, res) => {
  try {
    console.log("ADD TO CART HIT ");

    //  User check
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authorized ",
      });
    }

    const userId = req.user.id;
    const { foodId, quantity } = req.body;

    //  foodId validation
    if (!foodId) {
      return res.json({
        success: false,
        message: "foodId required ",
      });
    }

    const qty = quantity || 1;

    let cart = await Cart.findOne({ userId });

    // new cart
    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ foodId, quantity: qty }],
      });
    } else {
      //  check item exist
      const itemIndex = cart.items.findIndex(
        (item) => item.foodId.toString() === foodId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qty;
      } else {
        cart.items.push({ foodId, quantity: qty });
      }
    }

    await cart.save();

    return res.json({
      success: true,
      message: "Item added to cart",
      cart,
    });

  } catch (error) {
    console.log("ERROR", error);
    return res.json({ success: false, message: error.message });
  }
};


//  Get Cart
export const getCart = async (req, res) => {
  try {
    console.log("GET CART HIT ");

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authorized ",
      });
    }

    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate("items.foodId");

    return res.json({
      success: true,
      cart: cart || { items: [] },
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


//  Remove Item
export const removeFromCart = async (req, res) => {
  try {
    console.log("REMOVE CART HIT ");

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authorized ",
      });
    }

    const userId = req.user.id;
    const { foodId } = req.body;

    if (!foodId) {
      return res.json({
        success: false,
        message: "foodId required ",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found ",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.foodId.toString() !== foodId
    );

    await cart.save();

    return res.json({
      success: true,
      message: "Item removed ",
      cart,
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};