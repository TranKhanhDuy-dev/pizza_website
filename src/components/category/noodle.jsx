import React, { useState, useEffect, useMemo } from 'react';
import axios from "axios";
import Category from "../category/category.jsx";

const Noodle = ({ user: propUser, setShowLogin }) => {
  const [user, setUser] = useState(propUser || null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [modalMessage, setModalMessage] = useState('');
  const [modalMessageType, setModalMessageType] = useState('');

  // Lấy user từ localStorage khi load lại trang
  useEffect(() => {
    if (!user) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    }
  }, []);

  // Lấy sản phẩm từ server, chỉ lấy category === "mỳ"
  useEffect(() => {
    axios.get("http://localhost:3001/api/products")
      .then(res => {
        if (res.data.success) {
          setProducts(res.data.products.filter(p => p.category === "mỳ ý"));
        }
      })
      .catch(err => {
        console.error("Error fetching products:", err);
      });
  }, []);

  // Lọc các loại (type) trong mỳ
  const uniqueTypes = useMemo(() => {
    const types = new Set();
    products.forEach(p => types.add(p.type || "khác"));
    return Array.from(types);
  }, [products]);

  // Tạo danh sách danh mục
  const categories = [
    { label: "Tất cả", value: "tất cả" },
    ...uniqueTypes.map(type => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type
    }))
  ];

  // Group sản phẩm theo type
  const groupedProducts = useMemo(() => {
    const result = {};
    products.forEach(p => {
      const type = p.type || "khác";
      if (!result[type]) result[type] = [];
      result[type].push(p);
    });
    return result;
  }, [products]);

  // Tính giá chỉ dựa vào basePrice, extra, discount
  useEffect(() => {
    if (selectedProduct) {
      const extrasPrice = selectedExtras.reduce((total, extra) => {
        const found = selectedProduct.extra?.find(e => e.name === extra);
        return total + (found?.price || 0);
      }, 0);
      let price = (selectedProduct.quantity || 0) + extrasPrice;
      if (selectedProduct.discount > 0) {
        price -= selectedProduct.discount;
      }
      setCalculatedPrice(price * quantity);
    }
  }, [selectedProduct, selectedExtras, quantity]);

  // Mở modal sản phẩm
  const handleProductClick = (product) => {
    if (!user?.username) {
      setShowLogin(true);
      return;
    }
    setSelectedProduct(product);
    setSelectedExtras([]);
    setQuantity(1);
    setIsModalOpen(true);
    setModalMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedExtras([]);
    setQuantity(1);
    setModalMessage('');
  };

  const handleAddToCart = async () => {
    if (!user?.username) {
      setShowLogin(true);
      return;
    }
    const basePrice = selectedProduct.quantity || 0;
    const extrasPrice = selectedExtras.reduce((total, extra) => {
      const found = selectedProduct.extra?.find(e => e.name === extra);
      return total + (found?.price || 0);
    }, 0);
    const unitPrice = basePrice + extrasPrice;

    try {
      const response = await axios.post("http://localhost:3001/api/cart/add", {
        guestUsername: user.username,
        productId: selectedProduct.productId,
        productName: selectedProduct.productName,
        extras: selectedExtras,
        quantity,
        unitPrice,
        imagePath: selectedProduct.imagePath,
        basePrice
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

  // Render danh sách sản phẩm theo từng nhóm
  const renderProducts = (title, products) => (
    <div key={title}>
      <h1 className="mt-4 mb-4 text-xl font-bold text-black">Mỳ {title}</h1>
      <div className="flex max-w-full gap-4 overflow-x-auto sm:grid sm:grid-cols-5 sm:overflow-x-hidden">
        {products.map((product, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-shrink-0 w-48 p-3 transition-shadow bg-gray-100 rounded-lg shadow-md cursor-pointer group"
            onClick={() => handleProductClick(product)}
          >
            <img
              src={product.imagePath}
              alt={product.productName}
              className="object-contain w-full mb-4 bg-gray-100 rounded-md shadow-md max-h-80 group-hover:scale-110"
            />
            <p className="text-base font-semibold text-center text-gray-900">{product.productName}</p>
            <div className="flex items-center justify-between w-full mt-2">
              <div>
                {product.discount > 0 ? (
                  <>
                  <p className="text-xs text-gray-500 line-through">{product.quantity.toLocaleString()}đ</p>
                  <p className="text-base font-bold text-red-600">
                    {(product.quantity - product.discount).toLocaleString()}đ
                  </p>
                  </>
                  ) : (
                  <p className="text-base font-bold text-red-600">
                      {product.quantity.toLocaleString()}đ
                  </p>
                )}
              </div>
              <button
                className="flex items-center justify-center w-8 h-8 text-lg font-bold text-white bg-[#e50914] rounded-full hover:bg-red-500"
                onClick={e => { e.stopPropagation(); handleProductClick(product); }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-grow w-full pb-4 bg-white md:pl-24">
      <Category />
      <div className="w-full md:w-[72%] pt-6">
        {/* Bộ lọc loại mỳ */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {categories.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelectedCategory(value)}
              className={`px-4 py-2 text-sm font-medium rounded-full border ${
                selectedCategory === value
                  ? "bg-[#e50914] text-white"
                  : "bg-white text-black border-gray-300"
              } hover:bg-red-500 hover:text-white`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Danh sách sản phẩm */}
        {selectedCategory === "tất cả"
          ? Object.entries(groupedProducts).map(([type, items]) =>
              renderProducts(type, items)
            )
          : groupedProducts[selectedCategory]
          ? renderProducts(selectedCategory, groupedProducts[selectedCategory])
          : <p>Không có sản phẩm nào.</p>}
      </div>

      {/* Modal */}
      {isModalOpen && selectedProduct && (
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

            {/* Cột trái: ảnh + tổng tiền */}
            <div className="flex flex-col items-center w-full md:w-1/2">
              <img
                src={selectedProduct.imagePath}
                alt={selectedProduct.productName}
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

            {/* Cột phải: tên, mô tả, topping, số lượng và nút thêm */}
            <div className="w-full md:w-1/2 text-[17px]">
              <h2 className="mb-2 text-2xl font-bold text-left">
                {selectedProduct.productName}
              </h2>
              <p className="mb-4 text-base text-left text-gray-600">
                <span className="font-semibold text-black">Mô tả:</span> {selectedProduct.description}
              </p>

              {/* Thêm topping nếu có */}
              {selectedProduct.extra?.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-1 text-xl font-semibold">Tùy chọn:</h3>
                  {selectedProduct.extra.map((e, i) => (
                    <label key={i} className="block mb-2">
                      <input
                        type="checkbox"
                        name="extra"
                        value={e.name}
                        checked={selectedExtras.includes(e.name)}
                        onChange={(ev) => {
                          const value = ev.target.value;
                          setSelectedExtras((prev) =>
                            prev.includes(value)
                              ? prev.filter((x) => x !== value)
                              : [...prev, value]
                          );
                        }}
                        className="mr-2"
                      />
                      {e.name} {e.price > 0 ? `(+${e.price.toLocaleString()}đ)` : ""}
                    </label>
                  ))}
                </div>
              )}

              {/* Số lượng và nút thêm vào giỏ */}
              <div className="flex flex-col items-center justify-between gap-4 mt-5 sm:flex-row">
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
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Noodle;
