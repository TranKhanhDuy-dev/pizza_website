import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Combo = ({ user, setShowLogin }) => {
  const [combos, setCombos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [modalMessage, setModalMessage] = useState('');
  const [modalMessageType, setModalMessageType] = useState('');
  const [displayCount, setDisplayCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("import.meta.env.VITE_API_URL/api/products")
      .then(res => {
        if (res.data.success) {
          // Lọc chỉ lấy sản phẩm combo
          setCombos(res.data.products.filter(p => p.category === "combo"));
        }
      })
      .catch(err => {
        console.error("Error fetching combos:", err);
      });
  }, []);

  useEffect(() => {
    if (selectedCombo) {
      setCalculatedPrice(selectedCombo.quantity * quantity);
    }
  }, [selectedCombo, quantity]);

  const handleComboClick = (combo) => {
    if (!user?.username) {
      setShowLogin(true);
      return;
    }
    setSelectedCombo(combo);
    setQuantity(1);
    setCalculatedPrice(combo.quantity);
    setModalMessage('');
    setModalMessageType('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCombo(null);
    setQuantity(1);
    setModalMessage('');
    setModalMessageType('');
  };

  const handleAddToCart = async () => {
    if (!user?.username) {
      setShowLogin(true);
      return;
    }
    const unitPrice = selectedCombo.quantity;
    try {
      const response = await axios.post("import.meta.env.VITE_API_URL/api/cart/add", {
        guestUsername: user.username,
        productId: selectedCombo.productId,
        productName: selectedCombo.productName,
        quantity,
        unitPrice,
        imagePath: selectedCombo.imagePath,
        basePrice: selectedCombo.quantity,
        isCombo: true
      });

      if (response.data.success) {
        setModalMessage("Thêm vào giỏ hàng thành công!");
        setModalMessageType("success");
        setTimeout(() => closeModal(), 1000);
      } else {
        setModalMessage(response.data.message || "Thêm vào giỏ hàng thất bại!");
        setModalMessageType("error");
      }
    } catch (error) {
      setModalMessage("Có lỗi xảy ra khi thêm vào giỏ hàng.");
      setModalMessageType("error");
    }
  };

  return (
    <div className="w-full pt-4 bg-white">
      <h1 className="mb-4 text-xl font-bold text-black">Combo</h1>
      <div className="flex max-w-full gap-4 overflow-x-auto sm:overflow-x-hidden">
        {combos.slice(0, displayCount).map(combo => (
          <div key={combo._id} onClick={() => handleComboClick(combo)} className="relative flex flex-col items-center flex-shrink-0 w-48 p-3 transition-shadow bg-gray-100 rounded-lg shadow-md group">
           <img
              src={combo.imagePath}
              alt={combo.productName}
              className="object-contain w-full mb-4 bg-gray-100 rounded-md shadow-md max-h-80 group-hover:scale-110"
            />
            <p className="text-base font-semibold text-gray-900 h-[48px] line-clamp-2 text-center">{combo.productName}</p>
            <div className="flex items-center justify-between w-full mt-2">
              <p className="text-xl font-bold text-red-500">
                {`${combo.quantity.toLocaleString()}đ`}
              </p>
              <button
                className="flex items-center justify-center w-8 h-8 text-lg font-bold text-white bg-[#e50914] rounded-full hover:bg-red-500"
                aria-label="Mở tùy chọn combo"
                onClick={e => {
                  e.stopPropagation();
                  handleComboClick(combo);
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button className="px-6 py-2 text-white transition bg-[#e50914] rounded hover:bg-red-500" onClick={() => navigate("/combo")}>
          Xem thêm
        </button>
      </div>

      {isModalOpen && selectedCombo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
          onClick={closeModal}
        >
          <div
            className="relative flex flex-col gap-6 p-6 bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút X để đóng */}
            <button
              className="absolute text-3xl font-light text-gray-500 top-1 right-4 hover:text-gray-900"
              onClick={closeModal}
            >
              ×
            </button>

            {/* Cột trái: chỉ còn ảnh + tổng tiền */}
            <div className="flex flex-col items-center w-full md:w-1/2">
              <img
                src={selectedCombo.imagePath}
                alt={selectedCombo.productName}
                className="object-cover w-full h-auto mb-4 rounded-md shadow-md"
              />
              <h4 className="text-xl font-bold text-red-600">
                Tổng: {calculatedPrice.toLocaleString()}đ
              </h4>
              {modalMessage && (
                <p
                  className={`mt-3 text-lg ${
                    modalMessageType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {modalMessage}
                </p>
              )}
            </div>

            {/* Cột phải: tên, mô tả, số lượng, nút thêm */}
            <div className="w-full md:w-1/2 text-[17px]">
              <h2 className="mb-2 text-2xl font-bold text-left">
                {selectedCombo.productName}
              </h2>
              <p className="mb-4 text-base text-left text-gray-600">
                <span className="font-semibold text-black">Mô tả:</span> {selectedCombo.description}
              </p>
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center border rounded-md">
                  <button
                    className="px-4 py-2 text-xl font-bold text-gray-600 hover:bg-gray-100"
                    onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 py-2 text-lg text-center border-none focus:ring-0"
                  />
                  <button
                    className="px-4 py-2 text-xl font-bold text-gray-600 hover:bg-gray-100"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-grow w-full px-6 py-3 text-base font-semibold text-white transition bg-blue-500 rounded-md sm:w-auto hover:bg-blue-600"
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combo;