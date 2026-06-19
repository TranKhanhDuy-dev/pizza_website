const express = require("express");

module.exports = (OrderModel,CartModel) => {
  const router = express.Router();

  // GET danh sách đơn hàng theo username
  router.get("/orders/:username", async (req, res) => {
    try {
      const username = req.params.username;
      const orders = await OrderModel.find({ username }).sort({ createdAt: -1 });

      res.json({ success: true, orders });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy đơn hàng." });
    }
  });

  return router;
};