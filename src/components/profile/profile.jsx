import React, { useState, useEffect } from "react";
import { CheckProfile } from "./changeProfile";

const Profile = ({ user: propUser }) => {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    guestname: "",
    email: "",
    phone: "",
    address: "",
    avatarPath: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (propUser) {
      setUser(propUser);
    } else if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Lỗi khi parse user từ localStorage:", err);
      }
    }
  }, [propUser]);

  // Khi có user thì set formData
  useEffect(() => {
    if (user) {
      setFormData({
        guestname: user.guestname || user.staffname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        avatarPath: user.avatarPath || "/images/avatars/defaultAvatar.png",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        avatarPath: imageUrl,
        avatarFile: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    const profileCheck = CheckProfile(formData);
    if (!profileCheck.valid) {
      setErrorMessage(profileCheck.message || "Vui lòng điền đầy đủ và hợp lệ.");
      setSuccessMessage("");
      return;
    }

    try {
      let avatarPath = formData.avatarPath;

      // Nếu người dùng có chọn ảnh mới (blob URL => upload)
      if (formData.avatarFile) {
        const uploadData = new FormData();
        uploadData.append('avatar', formData.avatarFile);

        const uploadRes = await fetch("import.meta.env.VITE_API_URL/upload-avatar", {
          method: 'POST',
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        if (uploadResult.success) {
          avatarPath = uploadResult.filePath;
        } else {
          setErrorMessage("Tải ảnh thất bại");
          return;
        }
      }

      // Gửi profile kèm avatarPath mới
      const response = await fetch("import.meta.env.VITE_API_URL/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, avatarPath, username: user.username }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessMessage("Cập nhật thành công!");
        setErrorMessage("");
        const updated = {
          ...user,
          guestname: result.updatedUser.guestname || user.guestname,
          email: result.updatedUser.email,
          phone: result.updatedUser.phone,
          address: result.updatedUser.address,
          avatarPath: result.updatedUser.avatarPath,
        };

        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      }else {
        setErrorMessage(result.message || "Cập nhật thất bại.");
        setSuccessMessage("");
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setErrorMessage("Không thể kết nối máy chủ.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-xl">
        <h2 className="mb-4 text-2xl font-bold text-center">Thông tin cá nhân</h2>

        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 overflow-hidden rounded-full">
            <img
              src={
                formData.avatarFile
                  ? URL.createObjectURL(formData.avatarFile)
                  : `${formData.avatarPath}?${Date.now()}`
              }
              alt="Avatar"
              className="object-cover w-full h-full"
            />
            {formData.avatarFile && (
              <span className="absolute bottom-0 left-0 right-0 text-xs text-center text-white bg-yellow-500">
                Chưa lưu
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Ảnh đại diện</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-sm"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Họ và tên</label>
            <input
              type="text"
              name="guestname"
              value={formData.guestname}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        {errorMessage && (
            <div className="w-full px-4 py-2 mt-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                {errorMessage}
            </div>
        )}

        {successMessage && (
            <div className="w-full px-4 py-2 mt-4 text-sm text-green-700 bg-green-100 border border-green-300 rounded">
                {successMessage}
            </div>
        )}
        <button
          onClick={handleSave}
          className="w-full py-2 mt-4 text-white transition bg-blue-500 rounded-lg hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default Profile;