import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Pay = ({ user: propUser, type: propType }) => {
  const [user, setUser] = useState(propUser || null);
  const [type, setType] = useState(propType || null);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [momoParams, setMomoParams] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.guestname || user.staffname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedType = localStorage.getItem("type");

    if (!user && storedUser) setUser(storedUser);
    if (!type && storedType) setType(storedType);
  }, []);

  useEffect(() => {
    if (!user?.username) return;
    axios
      .get(`http://localhost:3001/api/cart/${user.username}`)
      .then(res => {
        if (res.data.success) {
          setCartItems(res.data.cartItems || []);
          const totalPrice = res.data.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
          setTotal(totalPrice);
        }
      })
      .catch(err => {
        console.error("Lỗi khi lấy giỏ hàng:", err);
      });
  }, [user]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resultCode = searchParams.get("resultCode");
    if (resultCode === "0") {
      const allParams = {};
      for (const [key, value] of searchParams.entries()) {
        allParams[key] = value;
      }
      setMomoParams(allParams);
      setShowModal(true);
    }
  }, [location.search]);

  const handleConfirmPayment = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!userInfo.name || !userInfo.phone || !userInfo.address || !userInfo.email) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin người nhận.");
      return;
    }

    try {
      // Gửi yêu cầu tạo thanh toán (chưa tạo đơn hàng)
      const momoRes = await axios.post("http://localhost:3001/api/momo/pay", {
        amount: total,
        orderInfo: `Thanh toán đơn hàng cho ${user.guestname || user.staffname}`,
        userInfo,
        username: user.username,
        cartItems
      });

      const orderId = momoRes?.data?.orderId;
      if (momoRes?.data?.payUrl && orderId) {
        // Lưu orderId để sau kiểm tra trạng thái
        sessionStorage.setItem("orderId", orderId);
        window.location.href = momoRes.data.payUrl;
      } else {
        setErrorMessage("Không thể tạo link thanh toán.");
      }
    } catch (err) {
      setErrorMessage("Lỗi khi xử lý thanh toán.");
      console.error(err);
    }
  };

  const handleCompleteOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:3001/api/create", {
        username: user.username,
        items: cartItems,
        total,
        receiver: userInfo,
        momoOrderId: momoParams.orderId,
        createdAt: new Date().toISOString()
      });

      if (response.data.success) {
        setSuccessMessage("Đã lưu đơn hàng thành công!");
        setShowModal(false);
        navigate("/cart");
      } else {
        setErrorMessage("Thanh toán xong nhưng không thể lưu đơn hàng.");
      }
    } catch (err) {
      console.error("Lỗi lưu đơn hàng:", err);
      setErrorMessage("Lỗi khi lưu đơn hàng.");
    } finally {
      setIsSubmitting(false); // nếu bạn muốn cho phép thử lại thì để dòng này
    }
  };
  return (
    <div className="flex flex-col w-full gap-4 px-4 pb-4 bg-white md:flex-row md:pl-32 md:pr-40">
      <div className="w-full p-6 border-r md:w-1/2">
        <h2 className="mb-4 text-xl font-semibold text-center text-gray-800">Thông Tin Người Nhận</h2>
        <div className="space-y-4">
          <input value={userInfo.name} placeholder="Họ tên" onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded" />
          <input value={userInfo.email} placeholder="Email" onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))} className="w-full p-2 border rounded" />
          <input value={userInfo.phone} placeholder="Số điện thoại" onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))} className="w-full p-2 border rounded" />
          <input value={userInfo.address} placeholder="Địa chỉ" onChange={(e) => setUserInfo(prev => ({ ...prev, address: e.target.value }))} className="w-full p-2 border rounded" />
          <p className="mt-4 font-bold text-right">
            Tổng: <span className="text-red-600">{total.toLocaleString()}đ</span>
          </p>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-green-600">{successMessage}</p>}
          <button onClick={handleConfirmPayment} className="w-full px-6 py-3 text-white bg-[#e50914] rounded">Xác nhận thanh toán</button>
        </div>
      </div>
      <div className="w-full p-6 md:w-1/2">
        <h2 className="mb-4 text-xl font-semibold text-center">Thông Tin Đơn Hàng</h2>
        <div className="max-h-[600px] overflow-y-auto space-y-4">
          {cartItems.map((item, index) => (
          <div key={index} className="flex items-start gap-4 p-4 mb-4 border rounded">
            {/* Hình ảnh sản phẩm */}
            <img
              src={item.imagePath}
              alt={item.productName}
              className="object-cover w-24 h-24 border rounded-md"
            />

            {/* Thông tin sản phẩm */}
            <div className="flex-grow">
              <p className="font-bold">{item.productName}</p>
              
              {/* Chỉ hiển thị Size nếu có */}
              {item.size && item.size !== "" && <p>Size: {item.size}</p>}
              
              {/* Chỉ hiển thị Crust (đế) nếu có */}
              {item.crust && item.crust !== "" && <p>Đế: {item.crust}</p>}
              
              {/* Chỉ hiển thị Extras nếu có phần tử */}
              {item.extras && item.extras.length > 0 && <p>Thêm: {item.extras.join(", ")}</p>}
              
              <p>Số lượng: {item.quantity}</p>
              <p className="font-semibold text-red-600">
                {(item.unitPrice * item.quantity).toLocaleString()}đ
              </p>
            </div>
          </div>
        ))}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-8 rounded shadow-lg text-center min-w-[350px]">
            <h2 className="mb-4 text-2xl font-bold text-green-600">Thanh toán thành công</h2>
            <div className="mb-4 overflow-auto text-sm text-left max-h-60">
              <div className="text-lg text-center">
                Bạn đã thanh toán thành công hóa đơn <span className="font-semibold text-blue-600">{momoParams.orderId} </span> 
                 với số tiền <span className="font-semibold text-green-600">{Number(momoParams.amount).toLocaleString()}đ</span>.
              </div>
            </div>
            <button
              className="px-6 py-2 mt-2 text-white bg-[#e50914] rounded hover:bg-red-600 disabled:opacity-50"
              onClick={handleCompleteOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Hoàn tất"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pay;