const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

router.post("/pay", async (req, res) => {
  // Thông tin MoMo
  const partnerCode = "MOMO";
  const accessKey = "F8BBA842ECF85";
  const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  const requestId = partnerCode + new Date().getTime();
  const orderId = requestId;
  const orderInfo = req.body.orderInfo
  const redirectUrl = 'http://localhost:5173/pay';
  const ipnUrl = 'http://localhost:3000/momo/ipn';
  const amount = req.body.amount;
  const requestType = "captureWallet";
  const extraData = "";

  // Chuỗi raw để ký
  const rawSignature = 
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  // Ký SHA256
  const signature = crypto.createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  // Payload gửi đến MoMo
  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: "vi"
  };

  try {
    console.log("🔍 Request gửi MoMo:", requestBody);
    console.log("🔑 Signature:", signature);
    const momoRes = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
      headers: { "Content-Type": "application/json" }
    });

    res.status(200).json(momoRes.data);
  } catch (error) {
    console.error("Lỗi MoMo:", error?.response?.data || error.message);
    res.status(500).json({ success: false, message: "Lỗi khi gửi yêu cầu thanh toán MoMo." });
  }
});

module.exports = router;
