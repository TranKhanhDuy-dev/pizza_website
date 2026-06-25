require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const axios = require('axios'); 
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const { checkAndCreateAdmin, insertProductsFromFile } = require('./utils/create');

const app = express();
app.use(cors());
app.use(express.json());
const verificationCodes = {};

// Kết nối MongoDB khi server chạy
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Tạo tài khoản admin
    checkAndCreateAdmin(StaffModel);
    // Tạo hoặc cập nhật bảng sản phẩm
    insertProductsFromFile(ProductModel);
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err.message));

// Schema & Model cho Staffs
const staffSchema = new mongoose.Schema({
  staffname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String},
  address: { type: String },
  password: { type: String, required: true },
  avatarPath: { type: String }
}, { timestamps: true });

const StaffModel = mongoose.model('staffs',staffSchema);

// Schema & Model cho Guests
const guestSchema = new mongoose.Schema({
  guestname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String},
  address: { type: String },
  password: { type: String, required: true },
  avatarPath: { type: String }
}, { timestamps: true });

const GuestModel = mongoose.model('guests', guestSchema);
// Schema & Model cho Products
const ProductSchema = new mongoose.Schema({
  productId: {type: String, required: true, unique: true},
  productName: {type: String, required: true},
  category: {type: String, required: true},
  type: {type: String},
  discount: {type: Number,default: 0,},
  quantity: {type: Number,default: 0,},
  description: {type: String,},
  size: [
    {
      name: String,
      price: { type: Number, default: 0 }
    }
  ],
  crust: [
    {
      name: String,
      price: { type: Number, default: 0 }
    }
  ],
  extra: [
    {
      name: String,
      price: { type: Number, default: 0 }
    }
  ],
  imagePath: {type: String,},
}, {
  timestamps: true,
});

const ProductModel = mongoose.model('products', ProductSchema);

// Schema & Model cho Carts
const cartSchema = new mongoose.Schema({
  guestUsername: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  size: { type: String, default: 'M' },
  crust: { type: String, default: 'thin' },
  extras: [{ type: String }],
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true },
  imagePath: { type: String}
}, { timestamps: true });

const CartModel = mongoose.model('carts', cartSchema);

//Schema & Model cho Orders
const orderSchema = new mongoose.Schema({
  billId: { type: String, required: true },
  username: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      size: { type: String, default: 'M' },
      crust: { type: String, default: 'thin' },
      extras: [{ type: String }],
      quantity: { type: Number, required: true, min: 1, default: 1 },
      unitPrice: { type: Number, required: true },
      imagePath: { type: String }
    }
  ],
  total: { type: Number, required: true },
  receiver: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'Đã thanh toán' }
  },
  createdAt: { type: Date, default: Date.now }
});

const OrderModel = mongoose.model('orders', orderSchema);

// Test endpoint để kiểm tra server & DB
app.get('/api/test-db', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ success: true, message: 'MongoDB connected' });
  } else {
    res.status(500).json({ success: false, message: 'MongoDB not connected' });
  }
});

//Đăng ký
app.post('/registerGuest', async (req, res) => {
  const { username, phone, password } = req.body;

  if (!username || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký' });
  }

  try {
    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await GuestModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Tên tài khoản đã tồn tại' });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingPhone = await GuestModel.findOne({ phone });
    if (existingPhone) {

      return res.status(400).json({ success: false, message: 'Số điện thoại đã được đăng ký' });
    }
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    // Tạo mới tài khoản
    const newGuest = new GuestModel({
      username,
      phone,
      password: hashedPassword,
      guestname: username,
      avatarPath: "/images/avatars/defaultAvatar.png"
    });
    await newGuest.save();

    return res.status(201).json({ success: true, message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Lỗi khi đăng ký khách:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

//Đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng nhập' });
  }

  try {
    let user = await StaffModel.findOne({ username: username });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const { password, ...userInfo } = user.toObject();
        return res.status(200).json({
          success: true,
          message: 'Đăng nhập thành công',
          user: userInfo,
          userType: 'staff'
        });
      } else {
        return res.status(401).json({ success: false, message: 'Sai mật khẩu' });
      }
    }

    const guest = await GuestModel.findOne({ username });
    if (guest) {
      const isMatch = await bcrypt.compare(password, guest.password);
      if (isMatch) {
        const { password, ...guestInfo } = guest.toObject();
        return res.status(200).json({
          success: true,
          message: 'Đăng nhập khách hàng thành công',
          user: guestInfo,
          userType: 'guest'
        });
      } else {
        return res.status(401).json({ success: false, message: 'Sai mật khẩu' });
      }
    }

    return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });

  } catch (err) {
    console.error("Lỗi khi đăng nhập:", err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Gửi mã xác minh
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function isPhone(input) {
  return /^[0-9]{9,15}$/.test(input);
}

//Gửi qua gmail
async function sendVerificationEmail(to, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Xác minh" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mã xác minh của bạn',
    text: `Mã xác minh của bạn là: ${code}`,
  });
}

// Gửi qua sms
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioPhone = '+18508314563';
const client = twilio(accountSid, authToken);
function normalizePhoneNumber(phone) {
  // Nếu bắt đầu bằng 0 => thay bằng +84
  if (phone.startsWith("0")) {
    return "+84" + phone.slice(1);
  }
  return phone;
}

async function sendSms(phoneNumber, code) {
  const normalized = normalizePhoneNumber(phoneNumber);

  try {
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${normalized}`,
      body: `Mã xác minh của bạn là: ${code}`
    });

    console.log(`✅ Đã gửi tin nhắn WhatsApp: ${message.sid}`);
  } catch (error) {
    console.error('❌ Lỗi khi gửi WhatsApp:', error.message);
  }
}
app.post('/send-verification-code', async (req, res) => {
  const { contact } = req.body;
  if (!contact) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin liên hệ' });
  }

  try {
    let guest;
    if (isEmail(contact)) {
      guest = await GuestModel.findOne({ email: contact });
    } else if (isPhone(contact)) {
      guest = await GuestModel.findOne({ phone: contact });
    } else {
      return res.status(400).json({ success: false, message: 'Thông tin liên hệ không hợp lệ' });
    }

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    const existing = verificationCodes[contact];

    // Nếu đã có mã và chưa hết hạn → gửi lại mã cũ
    if (existing && Date.now() < existing.expiresAt) {
      const timeLeft = Math.floor((existing.expiresAt - Date.now()) / 1000);
      console.log(`🔁 Gửi lại mã cũ cho ${contact}: ${existing.code} (còn ${timeLeft} giây)`);
      
      // Gửi lại mã qua Gmail hoặc SMS
      if (isEmail(contact)) {
        await sendVerificationEmail(contact, existing.code);
      } else if (isPhone(contact)) {
        await sendSms(contact, existing.code);
      }

      return res.json({
        success: true,
        message: 'Mã xác minh đã được gửi lại',
        resend: true,
        timeLeft,
      });
    }

    // Nếu chưa có hoặc đã hết hạn
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    verificationCodes[contact] = { code, expiresAt };

    // Gửi mã xác minh
    if (isEmail(contact)) {
      await sendVerificationEmail(contact, code);
    } else if (isPhone(contact)) {
      await sendSms(contact, code);
    }

    return res.json({
      success: true,
      message: 'Mã xác minh đã được gửi',
      resend: false,
      timeLeft: 300,
    });

  } catch (error) {
    console.error('❌ Lỗi khi gửi mã xác minh:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});
// Sửa thông tin cá nhân
const profileRoutes = require('./profile')(GuestModel);
app.use(profileRoutes);

// Tải ảnh đại diện
const uploadAvatarRoute = require('./upload-avatar');
app.use(uploadAvatarRoute);

// Đổi mật khẩu
app.post('/reset-password', async (req, res) => {
  const { contact, newPassword, code } = req.body;

  if (!contact || !newPassword || !code) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  }

  const record = verificationCodes[contact];
  if (!record || record.code !== code || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
  }

  try {
    let guest;
    if (isEmail(contact)) {
      guest = await GuestModel.findOne({ email: contact });
    } else {
      guest = await GuestModel.findOne({ phone: contact });
    }

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    // Cập nhật mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    guest.password = hashedPassword;
    await guest.save();

    // Xóa mã sau khi dùng
    delete verificationCodes[contact];

    return res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error("Lỗi reset mật khẩu:", error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});
// Sản phẩm
const productsRoutes = require("./products");
app.use("/api", productsRoutes(ProductModel, CartModel));

//Thanh toán
const payRoutes = require('./momo');
app.use('/api/momo', payRoutes);
app.post('/api/momo/ipn', async (req, res) => {
  const { resultCode, orderId, message } = req.body;

  try {
    if (resultCode === 0) {
      console.log(`✅ Thanh toán thành công cho đơn hàng: ${orderId}`);
      await OrderModel.findOneAndUpdate({ orderId }, { status: 'paid' });
    } else {
      console.warn(`❌ Thanh toán thất bại cho đơn hàng: ${orderId}. Lý do: ${message}`);
      await OrderModel.findOneAndUpdate({ orderId }, { status: 'failed' });
    }

    res.status(200).json({ message: 'Received MoMo IPN' });
  } catch (err) {
    console.error('❌ Lỗi xử lý IPN:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Check trạng thái thanh toán
app.get('/api/momo/ipn', async (req, res) => {
  const { orderId } = req.query;
  try {
    const order = await OrderModel.findOne({ orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    res.json({ success: true, status: order.status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra đơn hàng' });
  }
});
const clearRoutes = require('./pay')(OrderModel, CartModel);
app.use("/api", clearRoutes);

const createRoutes = require('./order')(OrderModel, CartModel);
app.use("/api", createRoutes);

// Server lắng nghe cổng 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
