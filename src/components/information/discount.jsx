import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Discount = ({ user, setShowLogin }) => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCrust, setSelectedCrust] = useState("");
  const [displayCount, setDisplayCount] = useState(5);
  const [selectedExtras, setSelectedExtras] = useState([]); 
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [modalMessage, setModalMessage] = useState('');
  const [modalMessageType, setModalMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("import.meta.env.VITE_API_URL/api/products")
      .then(res => {
        if (res.data.success) {
          // Lọc chỉ lấy sản phẩm có discount > 0
          setProducts(res.data.products.filter(p => p.discount > 0));
        }
      })
      .catch(err => {
        console.error("Error fetching products:", err);
      });
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      // Tính giá đã giảm
      let price = selectedProduct.quantity;
      if (selectedProduct.discounst > 0) {
        price = price - selectedProduct.discount;
      }
      setCalculatedPrice(price * quantity);
    }
  }, [selectedProduct, quantity]);

  const handleProductClick = (product) => {
    if (!user?.username) {
      setShowLogin(true);
      return;
    }
    setSelectedProduct(product);
    setSelectedSize(product.size?.[0]?.name || "");
    setSelectedCrust(product.crust?.[0]?.name || "");
    setSelectedExtras([]);
    setQuantity(1);
    setIsModalOpen(true);
    setModalMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setModalMessage('');
  };

  const handleAddToCart = async () => {
    if (!user?.username) {
      setShowLogin(true);
      return;
    }
    const basePrice = selectedProduct.quantity;
    const sizePrice = selectedProduct.size.find(s => s.name === selectedSize)?.price || 0;
    const crustPrice = selectedProduct.crust.find(c => c.name === selectedCrust)?.price || 0;
    const extrasPrice = selectedExtras.reduce((total, extra) => {
      const found = selectedProduct.extra.find(e => e.name === extra);
      return total + (found?.price || 0);
    }, 0);
    const unitPrice = basePrice + sizePrice + crustPrice + extrasPrice;

    try {
      const response = await axios.post("import.meta.env.VITE_API_URL/api/cart/add", {
        guestUsername: user.username,
        productId: selectedProduct.productId,
        productName: selectedProduct.productName,
        size: selectedSize,
        crust: selectedCrust,
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
      console.error("Error adding to cart:", error);
      setModalMessage("Có lỗi xảy ra khi thêm vào giỏ hàng.");
      setModalMessageType("error");
    }
  };

  return (
    <div className="w-full pt-4 bg-white">
      <h1 className="mb-4 text-xl font-bold text-black">Giảm giá</h1>
      <div className="flex max-w-full gap-4 overflow-x-auto sm:overflow-x-hidden">
        {products.slice(0, displayCount).map(product => (
          <div key={product._id} onClick={() => handleProductClick(product)} className="relative flex flex-col items-center flex-shrink-0 w-48 p-3 transition-shadow bg-gray-100 rounded-lg shadow-md group">
            <img
              src={product.imagePath}
              alt={product.productName}
              className="object-contain w-full mb-4 bg-gray-100 rounded-md shadow-md max-h-80 group-hover:scale-110"
            />
            <p className="text-base font-semibold text-gray-900 h-[48px] line-clamp-2 text-center">{product.productName}</p>
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
                aria-label="Mở tùy chọn giảm giá"
                onClick={e => { e.stopPropagation(); handleProductClick(product); }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button className="px-6 py-2 text-white transition bg-[#e50914] rounded hover:bg-red-500" onClick={() => navigate("/discounts")}>
          Xem thêm
        </button>
      </div>

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

          {/* Cột trái: chỉ còn ảnh + tổng tiền */}
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

          {/* Cột phải: tên, mô tả, chọn size, đế, topping, số lượng và nút thêm */}
          <div className="w-full md:w-1/2 text-[17px]">
            <h2 className="mb-2 text-2xl font-bold text-left">
              {selectedProduct.productName}
            </h2>
            <p className="mb-4 text-base text-left text-gray-600">
              <span className="font-semibold text-black">Mô tả:</span> {selectedProduct.description}
            </p>
            <div>
              <h3 className="mb-1 text-xl font-semibold">Chọn kích thước:</h3>
              {selectedProduct.size.map((s, i) => (
                <label key={i} className="block mb-2">
                  <input
                    type="radio"
                    name="size"
                    value={s.name}
                    checked={selectedSize === s.name}
                    onChange={() => setSelectedSize(s.name)}
                    className="mr-2"
                  />
                  {s.name} {s.price > 0 ? `(+${s.price.toLocaleString()}đ)` : "(Giá gốc)"}
                </label>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="mb-1 text-xl font-semibold">Chọn đế bánh:</h3>
              {selectedProduct.crust.map((c, i) => (
                <label key={i} className="block mb-2">
                  <input
                    type="radio"
                    name="crust"
                    value={c.name}
                    checked={selectedCrust === c.name}
                    onChange={() => setSelectedCrust(c.name)}
                    className="mr-2"
                  />
                  {c.name} {c.price > 0 ? `(+${c.price.toLocaleString()}đ)` : ""}
                </label>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="mb-1 text-xl font-semibold">Thêm Topping:</h3>
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

            {/* Số lượng và nút thêm vào giỏ */}
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

export default Discount;