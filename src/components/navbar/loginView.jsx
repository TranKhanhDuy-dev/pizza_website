import React, { useState, useEffect } from "react";
import { CheckPassword } from "./changePass";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginModal = ({ show, onClose, onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [forgotData, setForgotData] = useState({
    contact: "",
    newPassword: "",
    code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    if (show) {
      setFormData({ username: "", password: "" });
      setForgotData({ contact: "", newPassword: "", code: "" });
      setError("");
      setSuccessMessage("");
      setIsForgotPassword(false);
    }
  }, [show]);

  if (!show) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isForgotPassword) {
      setForgotData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    setError("");
    setSuccessMessage("");
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        onLogin(result.user, result.userType);
        setSuccessMessage("Đăng nhập thành công!");
        setError("");
        setFormData({ username: "", password: "" });
        onClose();
      } else {
        setError(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      setError("Không thể kết nối tới máy chủ");
    }
  };

  const handleForgotPassword = async () => {

    const validation = CheckPassword(forgotData);

    if (!validation.valid) {
      setSuccessMessage("");
      setError(validation.message);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessMessage("Đặt lại mật khẩu thành công!");
        setError("");
        setForgotData({ contact: "", newPassword: "", code: "" });
        setIsForgotPassword(false);
      } else {
        setError(result.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      setError("Không thể kết nối tới máy chủ");
    }
  };

  const handleSendCode = async () => {
    try {
      const response = await fetch("http://localhost:3001/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: forgotData.contact }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setError("");
        setSuccessMessage("Mã xác minh đã được gửi!");
      } else {
        setError(result.message || "Không thể gửi mã xác minh");
      }
    } catch (error) {
      console.error("Lỗi gửi mã:", error);
      setSuccessMessage("");
      setError("Không thể kết nối tới máy chủ");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-30" onClick={onClose}></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative p-6 bg-white rounded-lg shadow-lg w-80">
          <h2 className="mb-4 text-2xl font-bold text-center">
            {isForgotPassword ? "Quên mật khẩu" : "Đăng nhập"}
          </h2>

          {isForgotPassword ? (
            <>
              <label className="relative block mb-2">
                Mật khẩu mới
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={forgotData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </label>

              <label className="block mb-2">
                SĐT hoặc Gmail
                <div className="flex">
                  <input
                    type="text"
                    name="contact"
                    value={forgotData.contact}
                    onChange={handleInputChange}
                    placeholder="Nhập SĐT hoặc Gmail"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="px-3 text-sm text-white bg-[#007bff] rounded-r hover:bg-blue-400"
                  >
                    Gửi mã
                  </button>
                </div>
              </label>

              <label className="block mb-4">
                Mã xác minh
                <input
                  type="text"
                  name="code"
                  value={forgotData.code}
                  onChange={handleInputChange}
                  placeholder="Nhập mã xác minh"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block mb-2">
                Tài khoản
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tài khoản"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded"
                />
              </label>

              <label className="relative block mb-4">
                Mật khẩu
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-3 py-2 pr-10 mt-1 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </label>
            </>
          )}

          {error && (
            <p className="mb-3 text-sm font-medium text-center text-red-600">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="mb-3 text-sm font-medium text-center text-green-600">
              {successMessage}
            </p>
          )}

          <button
            className="w-full py-2 mb-2 text-white bg-blue-500 rounded-full hover:bg-blue-400"
            onClick={isForgotPassword ? handleForgotPassword : handleLogin}
          >
            {isForgotPassword ? "Xác nhận" : "Đăng nhập"}
          </button>
          <p
            className="mt-1 text-sm text-center text-gray-700"
          >
            Chưa có tài khoản?{" "}
            <span
              className="text-[#007bff] cursor-pointer hover:underline"
              onClick={onSwitchToRegister}
            >
              Đăng ký ngay
            </span>
          </p>
          <p
            className="mb-2 text-sm text-center text-[#007bff] cursor-pointer hover:underline"
            onClick={() => setIsForgotPassword((prev) => !prev)}
          >
            {isForgotPassword ? "Quay lại đăng nhập" : "Quên mật khẩu?"}
          </p>

          <button
            className="absolute text-gray-500 top-2 right-2 hover:text-gray-700"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
