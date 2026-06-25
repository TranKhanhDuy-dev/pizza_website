import React, { useState, useEffect  } from "react";
import { Register } from "./registerCheck";
import { FiEye, FiEyeOff } from "react-icons/fi";

const RegisterModal = ({ show, onClose, onLogin, onSwitchToLogin }) => {
  useEffect(() => {
    if (show) {
      setFormData({ username: "", password: "", phone: "" });
      setError("");
      setSuccessMessage("");
    }
  }, [show]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!show) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleRegister = async () => {
    const result = Register(formData);

    if (!result.success) {
      setError(result.message || "Dữ liệu không hợp lệ");
      setSuccessMessage(""); // <-- Xóa thông báo thành công nếu có
      return;
    }

    try {
      const res = await fetch("import.meta.env.VITE_API_URL/registerGuest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData({ username: "", password: "", phone: "" });
        setSuccessMessage("Đăng ký thành công!");
        setError(""); // <-- Xóa thông báo lỗi nếu có
      } else {
        setError(data.message || "Đăng ký thất bại");
        setSuccessMessage(""); // <-- Xóa thông báo thành công nếu có
      }
    } catch (error) {
      console.error("Lỗi kết nối đến server:", error);
      setError("Đã xảy ra lỗi khi kết nối đến server.");
      setSuccessMessage(""); // <-- Xóa thông báo thành công nếu có
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-30"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative p-6 bg-white rounded-lg shadow-lg w-80">
          <h2 className="mb-4 text-2xl font-bold text-center">Đăng ký</h2>

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

          <label className="relative block mb-2">
            Mật khẩu
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu"
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

          <label className="block mb-4">
            Số điện thoại
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded"
            />
          </label>

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
            className="w-full py-2 text-white transition bg-[#007bff] rounded-full shadow-md hover:bg-blue-400"
            onClick={handleRegister}
          >
            Đăng ký
          </button>
          <p className="mt-1 text-sm text-center text-gray-700">
            Đã có tài khoản?{" "}
            <span
              className="text-[#007bff] cursor-pointer hover:underline"
              onClick={onSwitchToLogin}
            >
              Đăng nhập ngay
            </span>
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

export default RegisterModal;