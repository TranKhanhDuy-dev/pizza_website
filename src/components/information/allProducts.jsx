import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Category from "../category/category.jsx";

const AllProducts = ({ user, type, setShowLogin }) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCrust, setSelectedCrust] = useState("");
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [modalMessage, setModalMessage] = useState('');
  const [modalMessageType, setModalMessageType] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteMessageType, setDeleteMessageType] = useState('');


  useEffect(() => {
    axios.get("http://localhost:3001/api/products")
      .then(res => {
        if (res.data.success) {
          setProducts(res.data.products);
        }
      })
      .catch(err => {
        console.error("Error fetching products:", err);
      });
  }, []);

  // Lấy danh sách category duy nhất từ DB, bỏ "combo"
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      if ((p.category || "khác").toLowerCase() !== "combo") {
        cats.add(p.category || "khác");
      }
    });
    return Array.from(cats);
  }, [products]);

  // Tạo danh sách danh mục category, bỏ "combo"
  const categories = [
    { label: "Tất cả", value: "tất cả" },
    ...uniqueCategories.map(cat => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat
    }))
  ];

  // Group sản phẩm theo category, bỏ "combo"
  const groupedProducts = useMemo(() => {
    const result = {};
    products.forEach(p => {
      const cat = (p.category || "khác").toLowerCase() === "combo" ? null : (p.category || "khác");
      if (!cat) return;
      if (!result[cat]) result[cat] = [];
      result[cat].push(p);
    });
    return result;
  }, [products]);

  // Tính giá cho modal
  useEffect(() => {
    if (selectedProduct) {
      let price = selectedProduct.quantity || 0;
      let sizePrice = 0, crustPrice = 0, extrasPrice = 0;
      if (selectedProduct.size?.length > 0 && selectedSize) {
        sizePrice = selectedProduct.size.find(s => s.name === selectedSize)?.price || 0;
      }
      if (selectedProduct.crust?.length > 0 && selectedCrust) {
        crustPrice = selectedProduct.crust.find(c => c.name === selectedCrust)?.price || 0;
      }
      if (selectedProduct.extra?.length > 0) {
        extrasPrice = selectedExtras.reduce((total, extra) => {
          const found = selectedProduct.extra.find(e => e.name === extra);
          return total + (found?.price || 0);
        }, 0);
      }
      let total = price + sizePrice + crustPrice + extrasPrice;
      if (selectedProduct.discount > 0) {
        total -= selectedProduct.discount;
      }
      setCalculatedPrice(total * quantity);
    }
  }, [selectedProduct, selectedSize, selectedCrust, selectedExtras, quantity]);

  // Mở modal sản phẩm
  const handleProductClick = (product) => {
    console.log("typeUser:", type);
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
    setSelectedSize("");
    setSelectedCrust("");
    setSelectedExtras([]);
    setQuantity(1);
    setModalMessage('');
  };

  const cancelDelete = () => {
    setProductToDelete(null); // đóng modal xác nhận
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) return;

    try {
      const res = await axios.delete(`http://localhost:3001/api/products/${productId}`);
      if (res.data.success) {
        setProducts(prev => prev.filter(p => p.productId !== productId));
        setDeleteMessage("Xoá sản phẩm thành công!");
        setDeleteMessageType("success");
      } else {
        setDeleteMessage(res.data.message || "Xoá sản phẩm thất bại!");
        setDeleteMessageType("error");
      }
    } catch (err) {
      setDeleteMessage("Có lỗi khi xoá sản phẩm!");
      setDeleteMessageType("error");
    } finally {
      setProductToDelete(null); // Đóng modal xác nhận xóa
      setTimeout(() => {
        setDeleteMessage('');
        setDeleteMessageType('');
      }, 3000);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!user?.username) {
      setShowLogin(true);
      return;
    }
    let basePrice = selectedProduct.quantity || 0;
    let sizePrice = 0, crustPrice = 0, extrasPrice = 0;
    if (selectedProduct.size?.length > 0 && selectedSize) {
      sizePrice = selectedProduct.size.find(s => s.name === selectedSize)?.price || 0;
    }
    if (selectedProduct.crust?.length > 0 && selectedCrust) {
      crustPrice = selectedProduct.crust.find(c => c.name === selectedCrust)?.price || 0;
    }
    if (selectedProduct.extra?.length > 0) {
      extrasPrice = selectedExtras.reduce((total, extra) => {
        const found = selectedProduct.extra.find(e => e.name === extra);
        return total + (found?.price || 0);
      }, 0);
    }
    let unitPrice = basePrice + sizePrice + crustPrice + extrasPrice;
    if (selectedProduct.discount > 0) {
      unitPrice -= selectedProduct.discount;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/cart/add", {
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
      setModalMessage("Có lỗi xảy ra khi thêm vào giỏ hàng.");
      setModalMessageType("error");
    }
  };

  // Render sản phẩm giống Pizza
 const renderProducts = (title, products) => (
  <div key={title} className="w-full pt-4 bg-white">
    <h1 className="mb-4 text-xl font-bold text-black">{title}</h1>
    <div className="flex flex-wrap gap-4 overflow-x-auto sm:overflow-x-hidden">
      {products.map(product => (
        <div
          key={product._id}
          onClick={() => handleProductClick(product)}
          className="relative flex flex-col items-center flex-shrink-0 w-48 p-3 transition-shadow bg-gray-100 rounded-lg shadow-md cursor-pointer group"
        >
          {type === "staff" && (
            <button
              className="absolute z-10 w-6 h-6 text-xs font-bold text-white bg-red-600 rounded top-1 right-1 hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation(); // Chặn mở modal chi tiết
                setProductToDelete(product); // Hiện modal xác nhận xoá
              }}
            >
              X
            </button>
          )}

          <img
            src={product.imagePath}
            alt={product.productName}
            className="object-contain w-full mb-4 bg-gray-100 rounded-md shadow-md max-h-80 group-hover:scale-110"
          />

          <p className="text-base font-semibold text-gray-900 h-[48px] line-clamp-2 text-center">
            {product.productName}
          </p>

          <div className="flex items-center justify-between w-full mt-2">
            <p className="text-xl font-bold text-red-500">
              {product.discount > 0
                ? (product.quantity - product.discount).toLocaleString() + "đ"
                : product.quantity.toLocaleString() + "đ"}
            </p>
            <button
              className="flex items-center justify-center w-8 h-8 text-lg font-bold text-white bg-[#e50914] rounded-full hover:bg-red-500"
              onClick={e => {
                e.stopPropagation();
                handleProductClick(product);
              }}
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
        {/* Bộ lọc theo category */}
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
          ? Object.entries(groupedProducts).map(([cat, items]) =>
              renderProducts(cat, items)
            )
          : groupedProducts[selectedCategory]
          ? renderProducts(selectedCategory, groupedProducts[selectedCategory])
          : <p>Không có sản phẩm nào.</p>}
      </div>
      {deleteMessage && (
        <div
          className={`fixed top-[120px] right-4 px-4 py-2 rounded shadow-lg z-50 text-white ${
            deleteMessageType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {deleteMessage}
        </div>
       )}

      {productToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 text-center bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Xác nhận xoá sản phẩm
          </h2>
          <p className="mb-6 text-gray-600">
            Bạn có chắc chắn muốn xoá sản phẩm{" "}
            <span className="font-semibold text-red-600">
              {productToDelete.productName}
            </span>
            ?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleDeleteProduct(productToDelete.productId)}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
            >
              Xác nhận
            </button>
            <button
              onClick={cancelDelete}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Modal sản phẩm */}
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

            {/* Cột phải: tên, mô tả, các tuỳ chọn nếu có */}
            <div className="w-full md:w-1/2 text-[17px]">
              <h2 className="mb-2 text-2xl font-bold text-left">
                {selectedProduct.productName}
              </h2>
              <p className="mb-4 text-base text-left text-gray-600">
                <span className="font-semibold text-black">Mô tả:</span> {selectedProduct.description}
              </p>

              {/* Chọn kích thước nếu có */}
              {selectedProduct.size?.length > 0 && (
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
              )}

              {/* Chọn đế nếu có */}
              {selectedProduct.crust?.length > 0 && (
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
              )}

              {/* Thêm topping nếu có */}
              {selectedProduct.extra?.length > 0 && (
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

export default AllProducts;