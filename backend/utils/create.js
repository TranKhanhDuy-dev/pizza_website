const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');

const checkAndCreateAdmin = async (StaffModel) => {
  try {
    const existingAdmin = await StaffModel.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Tài khoản admin đã tồn tại.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin#123', salt);

    const admin = new StaffModel({
      staffname: 'admin',
      username: 'admin',
      password: hashedPassword,
      phone: '0123456789',
      avatarPath: "/images/avatars/defaultAvatar.png"
    });

    await admin.save();
    console.log('Đã tạo tài khoản admin mặc định thành công!');
  } catch (error) {
    console.error('Lỗi khi kiểm tra hoặc tạo tài khoản admin:', error);
  }
};

const insertProductsFromFile = async (ProductModel) => {
  try {
    const dataPath = path.join(__dirname, 'products.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const products = JSON.parse(rawData);

    for (const item of products) {
      const exists = await ProductModel.findOne({ productId: item.productId });
      if (!exists) {
        await ProductModel.create(item);
        console.log(`Đã thêm: ${item.productName}`);
      }
    }

    console.log('✅ Hoàn tất import sản phẩm từ JSON.');
  } catch (err) {
    console.error('❌ Lỗi khi import sản phẩm:', err.message);
  }
};

module.exports = {
  checkAndCreateAdmin,
  insertProductsFromFile
};