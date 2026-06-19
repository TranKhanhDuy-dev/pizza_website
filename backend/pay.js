require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const client = twilio(accountSid, authToken);

const twilioPhone = process.env.TWILIO_PHONE;
const adminEmail = process.env.EMAIL_USER;

module.exports = (OrderModel, CartModel) => {
  const router = express.Router();

  async function sendEmail(to, subject, content) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    await transporter.sendMail({
      from: `"Pizza Order" <${adminEmail}>`,
      to,
      subject,
      text: content,
    });
  }

  async function sendWhatsApp(phone, content) {
    const normalized = phone.startsWith("0") ? "+84" + phone.slice(1) : phone;
    await client.messages.create({
      from: twilioPhone,
      to: `whatsapp:${normalized}`,
      body: content,
    });
  }

  // Tạo đơn hàng sau thanh toán
  router.post("/create", async (req, res) => {
    try {
      const { username, receiver, items, total, momoOrderId, createdAt } = req.body;

      const newOrder = new OrderModel({
        billId: momoOrderId,
        username,
        receiver,
        items,
        total,
        status: "Đã thanh toán",
        createdAt,
      });

      await newOrder.save();

      const itemList = items.map((item, i) =>
      `\t${i + 1}. ${item.productName} - SL: ${item.quantity} - Size: ${item.size} - Giá: ${(item.unitPrice * item.quantity).toLocaleString()}đ`
    ).join("\n");

      const content = `
        THANH TOÁN ĐƠN HÀNG THÀNH CÔNG
        Khách hàng: ${receiver.name}
        Thời gian: ${createdAt}
        Mã đơn hàng: ${momoOrderId}
        Tổng tiền: ${total.toLocaleString()}đ

        Chi tiết:
        ${itemList}

        Cảm ơn bạn đã đặt hàng!
      `.trim();

      if (receiver.email) await sendEmail(receiver.email, "Xác nhận thanh toán đơn hàng thành công", content);
      if (receiver.phone) await sendWhatsApp(receiver.phone, content);

      await CartModel.deleteMany({ guestUsername: username });

      return res.status(200).json({
        success: true,
        message: "Tạo đơn hàng thành công và đã gửi thông báo.",
        orderId: newOrder._id,
      });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi máy chủ.",
      });
    }
  });

  return router;
};