export function CheckPassword({ contact, newPassword, code }) {
  if (!contact || !newPassword || !code) {
    return {
      valid: false,
      message: "Vui lòng nhập đầy đủ thông tin.",
    };
  }

  if (newPassword.length < 6) {
    return {
      valid: false,
      message: "Mật khẩu mới phải có ít nhất 6 ký tự",
    };
  }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
    return {
      success: false,
      message:
        "Mật khẩu phải chứa ít nhất một chữ in hoa, một chữ thường, một số và một ký tự đặc biệt.",
    };
  }

  return { valid: true };
}