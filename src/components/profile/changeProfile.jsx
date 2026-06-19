export function CheckProfile(formData) {
  const { name, email, phone, address, avatarPath } = formData;

  // Kiểm tra tên
  const specialOrEmojiRegex = /[^\p{L}\p{N} ]/u;
    if (specialOrEmojiRegex.test(name)) {
      return {
        success: false,
        message: "Tên chỉ được chứa chữ và số, không có ký tự đặc biệt hoặc icon.",
      };
    }

  // Kiểm tra email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return { valid: false, message: "Email không hợp lệ." };
  }

  // Kiểm tra số điện thoại
  const phoneRegex = /^[0-9]{9,15}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: "Số điện thoại phải có từ 9 đến 15 chữ số." };
  }

  return { valid: true };
}