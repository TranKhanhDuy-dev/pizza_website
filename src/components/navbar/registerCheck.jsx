import React from "react";
import { useLocation } from "react-router-dom";

export const Register = (data) => {
  const { username, password, phone } = data;

  // 1. Kiểm tra rỗng
  if (!username || !password || !phone) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin." };
  }

  // 2. Kiểm tra username chứa ký tự đặc biệt hoặc emoji/icon
  const specialOrEmojiRegex = /[^a-zA-Z0-9]/; // Chỉ cho phép chữ và số
  if (specialOrEmojiRegex.test(username)) {
    return {
      success: false,
      message: "Tên đăng nhập chỉ được chứa chữ và số, không có ký tự đặc biệt hoặc icon.",
    };
  }

  // 3. Kiểm tra độ dài password
  if (password.length < 6) {
    return {
      success: false,
      message: "Mật khẩu phải có ít nhất 6 ký tự.",
    };
  }

  // 4. Kiểm tra password: số, chữ thường, chữ in hoa, ký tự đặc biệt
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
    return {
      success: false,
      message:
        "Mật khẩu phải chứa ít nhất một chữ in hoa, một chữ thường, một số và một ký tự đặc biệt.",
    };
  }

  // 5. Kiểm tra số điện thoại: 10 số, không chữ, không ký tự đặc biệt, không emoji
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return {
      success: false,
      message: "Số điện thoại phải gồm đúng 10 chữ số và không chứa chữ hoặc ký tự đặc biệt.",
    };
  }
  return { success: true };
};