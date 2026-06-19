// routes/products.js
const express = require("express");
const router = express.Router();

module.exports = (ProductModel, CartModel) => {
  // Lấy tất cả sản phẩm
  router.get("/products", async (req, res) => {
    try {
      const products = await ProductModel.find();
      res.status(200).json({ success: true, products });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi lấy sản phẩm", error: err.message });
    }
  });

  // Thêm sản phẩm vào giỏ hàng
  router.post("/cart/add", async (req, res) => {
    try {
      const {
        guestUsername, productId, productName,
        size, crust, extras, quantity,
        unitPrice, imagePath
      } = req.body;

      const cleanPath = imagePath.replace("/src/assets", "");

      const itemData = {
        guestUsername,
        productId,
        productName,
        quantity,
        unitPrice,
        imagePath: cleanPath,
        size: size || "",
        crust: crust || "",
        extras: (Array.isArray(extras) && extras.length > 0) ? extras : []
      };
      if (size) itemData.size = size;
      if (crust) itemData.crust = crust;
      if (extras && Array.isArray(extras) && extras.length > 0) itemData.extras = extras;

      const newItem = new CartModel(itemData);

      const saved = await newItem.save();
      res.status(201).json({ success: true, cartItem: saved });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi thêm giỏ hàng", error: err.message });
    }
  });

  // Lấy giỏ hàng theo guestUsername
  router.get("/cart/:guestUsername", async (req, res) => {
    try {
      const items = await CartModel.find({ guestUsername: req.params.guestUsername });
      res.status(200).json({ success: true, cartItems: items });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi lấy giỏ hàng", error: err.message });
    }
  });
  // Chỉnh sửa sản phẩm
  router.get("/cart/item/:id", async (req, res) => {
    try {
      // Lấy item trong cart
      const item = await CartModel.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng" });
      }
      // Lấy sản phẩm gốc từ bảng products
      const product = await ProductModel.findOne({ productId: item.productId });
      if (!product) {
        return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm gốc" });
      }
      res.status(200).json({ success: true, item, product });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
    }
  });

  // Cập nhật số lượng
  router.put("/cart/update-quantity", async (req, res) => {
    const { itemId, quantity } = req.body;
    if (!itemId || quantity < 1) {
      return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
    }

    try {
      const updated = await CartModel.findByIdAndUpdate(itemId, { quantity }, { new: true });
      res.status(200).json({ success: true, updatedItem: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật", error: err.message });
    }
  });

  // Xóa sản phẩm
  router.delete("/products/:productId", async (req, res) => {
    const { productId } = req.params;

    try {
      const deleted = await ProductModel.findOneAndDelete({ productId });

      if (!deleted) {
        return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm để xóa" });
      }

      return res.json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      return res.status(500).json({ success: false, message: "Lỗi server khi xóa sản phẩm" });
    }
  });

  // Xóa sản phẩm khỏi giỏ hàng
  router.delete("/cart/delete/:itemId", async (req, res) => {
    const { itemId } = req.params;

    try {
      const deleted = await CartModel.findByIdAndDelete(itemId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Không tìm thấy item để xoá" });
      }
      return res.json({ success: true, message: "Đã xoá item khỏi giỏ hàng" });
    } catch (error) {
      console.error("Lỗi khi xóa item:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  });
  
  // Cập nhật toàn bộ thông tin sản phẩm trong giỏ hàng
  router.put("/cart/update-item", async (req, res) => {
    const { itemId, size, crust, extras, quantity } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "Thiếu itemId" });
    }

    try {
      const updated = await CartModel.findByIdAndUpdate(itemId, {
        size, crust, extras, quantity
      }, { new: true });

      res.status(200).json({ success: true, updatedItem: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật sản phẩm", error: err.message });
    }
  });

  return router;
};