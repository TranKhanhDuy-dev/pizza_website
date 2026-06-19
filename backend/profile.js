const express = require('express');
const router = express.Router();

module.exports = (GuestModel) => {
  router.put('/update-profile', async (req, res) => {
    const { username, guestname, email, phone, address, avatarPath } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Thiếu username để cập nhật.' });
    }

    try {
      const updatedUser = await GuestModel.findOneAndUpdate(
        { username },
        { guestname, email, phone, address, avatarPath },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để cập nhật.' });
      }

      return res.status(200).json({ success: true, updatedUser });
    } catch (error) {
      console.error('Lỗi khi cập nhật hồ sơ:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật.' });
    }
  });

  return router;
};