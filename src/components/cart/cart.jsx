import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CartPage = ({ user }) => {
  const [selectedTab, setActiveTab] = useState("cart");
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modal edit
  const [editProduct, setEditProduct] = useState(null);
  const [editCartItem, setEditCartItem] = useState(null);
  const [editSize, setEditSize] = useState("");
  const [editCrust, setEditCrust] = useState("");
  const [editExtras, setEditExtras] = useState([]);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editPrice, setEditPrice] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();

  // Lấy giỏ hàng từ DB
  useEffect(() => {
    if (!user?.username) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/cart/${user.username}`)
      .then(res => {
        if (res.data.success) {
          setCartItems(res.data.cartItems);
          updateTotal(res.data.cartItems);
        }
      }).catch(console.error);
  }, [user]);

  // Lấy hóa đơn từ DB
  useEffect(() => {
    if (selectedTab === "orders" && user?.username) {
      setLoadingOrders(true);
      axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${user.username}`)
        .then(res => {
          if (res.data.success) {
            const sortedOrders = res.data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
          }
        })
        .catch(err => console.error("Lỗi khi lấy đơn hàng:", err))
        .finally(() => setLoadingOrders(false));
    }
  }, [selectedTab, user]);

  // Tính tổng tiền giỏ hàng dựa vào dữ liệu DB
  const updateTotal = async (items) => {
    let total = 0;
    for (const item of items) {
      // Lấy cả cart item và product từ backend
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart/item/${item._id}`);
      if (res.data.success && res.data.product && res.data.item) {
        const product = res.data.product;
        const cartItem = res.data.item;
        let basePrice = product.quantity || 0;
        let sizePrice = 0, crustPrice = 0, extrasPrice = 0;
        if (Array.isArray(product.size) && cartItem.size) {
          const sizeObj = product.size.find(s => s.name === cartItem.size);
          if (sizeObj) sizePrice = sizeObj.price || 0;
        }
        if (Array.isArray(product.crust) && cartItem.crust) {
          const crustObj = product.crust.find(c => c.name === cartItem.crust);
          if (crustObj) crustPrice = crustObj.price || 0;
        }
        if (Array.isArray(product.extra) && Array.isArray(cartItem.extras)) {
          extrasPrice = cartItem.extras.reduce((sum, extraName) => {
            const extraObj = product.extra.find(e => e.name === extraName);
            return sum + (extraObj ? extraObj.price || 0 : 0);
          }, 0);
        }
        let price = basePrice + sizePrice + crustPrice + extrasPrice;
        if (product.discount > 0) price -= product.discount;
        total += price * (cartItem.quantity || 1);
      }
    }
    setTotalPrice(total);
  };

  // Khi chỉnh sửa, luôn tính giá dựa vào DB
  useEffect(() => {
    const fetchPrice = async () => {
      if (editProduct) {
        let basePrice = editProduct.quantity || 0;
        let sizePrice = 0, crustPrice = 0, extrasPrice = 0;
        if (Array.isArray(editProduct.size) && editSize) {
          const sizeObj = editProduct.size.find(s => s.name === editSize);
          if (sizeObj) sizePrice = sizeObj.price || 0;
        }
        if (Array.isArray(editProduct.crust) && editCrust) {
          const crustObj = editProduct.crust.find(c => c.name === editCrust);
          if (crustObj) crustPrice = crustObj.price || 0;
        }
        if (Array.isArray(editProduct.extra) && Array.isArray(editExtras)) {
          extrasPrice = editExtras.reduce((sum, extraName) => {
            const extraObj = editProduct.extra.find(e => e.name === extraName);
            return sum + (extraObj ? extraObj.price || 0 : 0);
          }, 0);
        }
        let price = basePrice + sizePrice + crustPrice + extrasPrice;
        if (editProduct.discount > 0) price -= editProduct.discount;
        setEditPrice(price * editQuantity);
      }
    };
    fetchPrice();
  }, [editProduct, editSize, editCrust, editExtras, editQuantity]);

  // Xóa sản phẩm
  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    axios.delete(`http://localhost:3001/api/cart/delete/${itemToDelete}`)
      .then(res => {
        if (res.data.success) {
          const updated = cartItems.filter(item => item._id !== itemToDelete);
          setCartItems(updated);
          updateTotal(updated);
        }
      }).finally(() => {
        setShowDeleteModal(false);
        setItemToDelete(null);
      });
  };

  // Tăng giảm số lượng
  const updateQuantity = (itemId, delta) => {
    const item = cartItems.find((it) => it._id === itemId);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    axios.put(`${import.meta.env.VITE_API_URL}/api/cart/update-quantity`, { itemId, quantity: newQuantity })
      .then(res => {
        if (res.data.success) {
          const updated = cartItems.map((it) => it._id === itemId ? { ...it, quantity: newQuantity } : it);
          setCartItems(updated);
          updateTotal(updated);
        }
      });
  };

  // Mở modal chỉnh sửa: lấy cả cart item và product từ backend
  const openEditModal = async (itemId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart/item/${itemId}`);
      if (res.data.success && res.data.product && res.data.item) {
        setEditProduct(res.data.product);
        setEditCartItem(res.data.item);
        setEditSize(res.data.item.size || (res.data.product.size?.[0]?.name || ""));
        setEditCrust(res.data.item.crust || (res.data.product.crust?.[0]?.name || ""));
        setEditExtras(res.data.item.extras || []);
        setEditQuantity(res.data.item.quantity || 1);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    }
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/cart/update-item`, {
      itemId: editCartItem._id,
      size: editSize,
      crust: editCrust,
      extras: editExtras,
      quantity: editQuantity
    });
    setIsEditModalOpen(false);
    // Reload cart
    axios.get(`${import.meta.env.VITE_API_URL}/api/cart/${user.username}`).then(res => {
      if (res.data.success) {
        setCartItems(res.data.cartItems);
        updateTotal(res.data.cartItems);
      }
    });
  };

  // Helper lấy nhãn crust/extra từ DB
  const getCrustLabel = (product, crustValue) => {
    if (!product || !Array.isArray(product.crust)) return crustValue;
    const found = product.crust.find(c => c.name === crustValue);
    return found ? found.name : crustValue;
  };
  const getExtraLabel = (product, extraValue) => {
    if (!product || !Array.isArray(product.extra)) return extraValue;
    const found = product.extra.find(e => e.name === extraValue);
    return found ? found.name : extraValue;
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  // Hàm helper để lấy màu cho trạng thái
  const getStatusPill = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("đã thanh toán")) {
      return <span className="text-green-600">Đã thanh toán</span>;
    } else if (normalized.includes("đang xử lý") || normalized.includes("chờ")) {
      return <span className="text-yellow-500">Đang xử lý</span>;
    } else {
      return <span className="text-red-500">Lỗi đơn hàng</span>;
    }
  };

  return (
    <div className="flex flex-col flex-grow w-full pt-6 pb-4 bg-white md:pl-36 md:pr-44">
      {/* Thanh chuyển tab */}
      <div className="flex pb-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("cart")}
          className={`px-4 py-2 font-semibold rounded-t ${selectedTab === "cart" ? "bg-[#e50914] text-white z-10" : "bg-gray-200 text-gray-700"}`}
        >
          Giỏ hàng
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 font-semibold rounded-t -ml-px ${selectedTab === "orders" ? "bg-[#e50914] text-white z-10" : "bg-gray-200 text-gray-700"}`}
        >
          Hóa đơn
        </button>
      </div>

      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        {selectedTab === "cart" ? "Giỏ hàng của bạn" : "Danh sách hóa đơn"}
      </h2>

      {/* Tab giỏ hàng */}
      {selectedTab === "cart" && (
        <>
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item._id}
                  item={item}
                  openEditModal={openEditModal}
                  updateQuantity={updateQuantity}
                  setItemToDelete={setItemToDelete}
                  setShowDeleteModal={setShowDeleteModal}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600 border rounded bg-gray-50">Không có sản phẩm nào trong giỏ hàng.</div>
          )}
          {cartItems.length > 0 && (
            <div className="w-full p-4 mt-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                <div className="text-lg font-bold">Tổng cộng: <span className="text-red-600">{totalPrice.toLocaleString("vi-VN")}₫</span></div>
                <button onClick={() => navigate("/pay")} className="w-full px-6 py-3 text-white bg-[#e50914] rounded hover:bg-red-500 md:w-auto md:py-2">Thanh toán</button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedTab === "orders" && (
        <div className="w-full">
          {loadingOrders ? (
            <div className="p-6 text-center text-gray-600 border rounded bg-gray-50">Không có hóa đơn đã thanh toán nào.</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-600 border rounded bg-gray-50">Bạn chưa có hóa đơn nào.</div>
          ) : (
            <div className="space-y-3">
              {/* Header của bảng */}
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-6 px-4 py-2 font-bold text-gray-600 bg-gray-100 rounded-t">
                <span>Mã hóa đơn</span>
                <span>Ngày đặt</span>
                <span className="text-center">Trạng thái</span>
                <span className="text-right">Thao tác</span>
              </div>
              {/* Danh sách hóa đơn */}
              {orders.map((order) => (
                <div key={order._id} className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center gap-x-6 p-4 bg-white border rounded shadow-sm hover:bg-gray-50 transition">
                  <span className="text-base text-gray-800 truncate " title={order.billId || order._id}>
                    {order.billId || order._id}
                  </span>
                  <span className="text-base text-gray-600">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </span>
                  <div className="text-base text-center">
                    {getStatusPill(order.receiver.status)}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleViewOrderDetails(order)}
                      className="px-4 py-1 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Modal chi tiết hóa đơn*/}
      {isOrderDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b">
              <h3 className="text-xl font-bold">Chi tiết hóa đơn</h3>
              <button onClick={() => setIsOrderDetailModalOpen(false)} className="text-2xl text-gray-500 hover:text-gray-800">×</button>
            </div>
            <div className="space-y-4">
              <p><strong>Mã hóa đơn:</strong> <span >{selectedOrder.billId || selectedOrder._id}</span></p>
              <p><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}</p>
              <p><strong>Trạng thái:</strong> {getStatusPill(selectedOrder.receiver.status)}</p>
              <p><strong>Tổng thanh toán:</strong> <span className="text-xl font-bold text-red-600">{selectedOrder.total.toLocaleString("vi-VN")}₫</span></p>
              
              <div className="pt-4 mt-4 border-t">
                <h4 className="mb-3 text-lg font-semibold">Các sản phẩm đã đặt:</h4>
                <ul className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    // Sử dụng flex để căn chỉnh ảnh và nội dung
                    <li key={idx} className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
                      {/* Cột ảnh */}
                      <img 
                        src={item.imagePath} 
                        alt={item.productName} 
                        className="object-cover w-16 h-16 rounded-md" 
                      />
                      {/* Cột thông tin sản phẩm */}
                      <div className="flex-grow">
                        <p className="font-semibold">{item.productName}</p>
                        <div className="text-sm text-gray-600">
                          <p>Số lượng: {item.quantity}</p>
                          <p>Size: {item.size} - Vỏ: {item.crust}</p>
                          <p>Đơn giá: {item.unitPrice.toLocaleString("vi-VN")}₫</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 mt-4 border-t">
                  <h4 className="mb-2 text-lg font-semibold">Thông tin giao hàng:</h4>
                  <div className="pl-4 text-sm">
                      <p><strong>Người nhận:</strong> {selectedOrder.receiver.name}</p>
                      <p><strong>Số điện thoại:</strong> {selectedOrder.receiver.phone}</p>
                      <p><strong>Địa chỉ:</strong> {selectedOrder.receiver.address}</p>
                  </div>
              </div>

            </div>
            <div className="flex justify-end pt-4 mt-6 border-t">
                <button onClick={() => setIsOrderDetailModalOpen(false)} className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Xác nhận xoá</h2>
            <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xoá sản phẩm này khỏi giỏ hàng không?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={confirmDeleteItem}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Xoá
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa sản phẩm */}
      {isEditModalOpen && editProduct && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div
          className="relative flex flex-col gap-6 p-6 bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto md:flex-row"
          onClick={e => e.stopPropagation()}
        >
          {/* Nút X để đóng */}
          <button
            className="absolute text-3xl font-light text-gray-500 top-1 right-4 hover:text-gray-900"
            onClick={() => setIsEditModalOpen(false)}
          >
            ×
          </button>
          {/* Cột trái: ảnh + tổng tiền */}
          <div className="flex flex-col items-center w-full md:w-1/2">
            <img
              src={editProduct.imagePath}
              alt={editProduct.productName}
              className="object-cover w-full h-auto mb-4 rounded-md shadow-md"
            />
            <h4 className="text-xl font-bold text-red-600">
              Tổng: {editPrice.toLocaleString()}đ
            </h4>
          </div>
          {/* Cột phải: tên, mô tả, chọn size, crust, topping, số lượng, lưu */}
          <div className="w-full md:w-1/2 text-[17px]">
            <h2 className="mb-2 text-2xl font-bold text-left">
              {editProduct.productName}
            </h2>
            <p className="mb-4 text-base text-left text-gray-600">
              <span className="font-semibold text-black">Mô tả:</span> {editProduct.description}
            </p>
            {/* Size */}
            {Array.isArray(editProduct.size) && editProduct.size.length > 0 && (
              <div>
                <h3 className="mb-1 text-xl font-semibold">Chọn kích thước:</h3>
                {editProduct.size.map((s, i) => (
                  <label key={i} className="block mb-2">
                    <input
                      type="radio"
                      name="edit-size"
                      value={s.name}
                      checked={editSize === s.name}
                      onChange={() => setEditSize(s.name)}
                      className="mr-2"
                    />
                    {s.name} {s.price > 0 ? `(+${s.price.toLocaleString()}đ)` : "(Giá gốc)"}
                  </label>
                ))}
              </div>
            )}
            {/* Crust */}
            {Array.isArray(editProduct.crust) && editProduct.crust.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-1 text-xl font-semibold">Chọn đế bánh:</h3>
                {editProduct.crust.map((c, i) => (
                  <label key={i} className="block mb-2">
                    <input
                      type="radio"
                      name="edit-crust"
                      value={c.name}
                      checked={editCrust === c.name}
                      onChange={() => setEditCrust(c.name)}
                      className="mr-2"
                    />
                    {c.name} {c.price > 0 ? `(+${c.price.toLocaleString()}đ)` : ""}
                  </label>
                ))}
              </div>
            )}
            {/* Extras */}
            {Array.isArray(editProduct.extra) && editProduct.extra.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-1 text-xl font-semibold">Thêm Topping:</h3>
                {editProduct.extra.map((e, i) => (
                  <label key={i} className="block mb-2">
                    <input
                      type="checkbox"
                      name="edit-extra"
                      value={e.name}
                      checked={editExtras.includes(e.name)}
                      onChange={(ev) => {
                        const value = ev.target.value;
                        setEditExtras((prev) =>
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
            {/* Nút lưu và số lượng */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center border rounded-md">
                <button
                  className="px-4 py-2 text-xl font-bold text-gray-600 hover:bg-gray-100"
                  onClick={() => setEditQuantity((q) => (q > 1 ? q - 1 : 1))}
                >
                  −
                </button>
                <input
                  type="text"
                  value={editQuantity}
                  readOnly
                  className="w-12 py-2 text-lg text-center border-none focus:ring-0"
                />
                <button
                  className="px-4 py-2 text-xl font-bold text-gray-600 hover:bg-gray-100"
                  onClick={() => setEditQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleSaveEdit}
                className="flex-grow w-full px-6 py-3 text-base font-semibold text-white transition bg-blue-500 rounded-md sm:w-auto hover:bg-blue-600"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

// Hiển thị từng dòng sản phẩm trong giỏ hàng, luôn lấy nhãn và giá từ DB
function CartItemRow({ item, openEditModal, updateQuantity, setItemToDelete, setShowDeleteModal }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Lấy cả cart item và product từ backend
    axios.get(`${import.meta.env.VITE_API_URL}/api/cart/item/${item._id}`).then(res => {
      if (res.data.success && res.data.product) setProduct(res.data.product);
    });
  }, [item._id]);

  // Tính giá từng item dựa vào DB
  const getItemPrice = () => {
    if (!product) return 0;
    let basePrice = product.quantity || 0;
    let sizePrice = 0, crustPrice = 0, extrasPrice = 0;
    if (Array.isArray(product.size) && item.size) {
      const sizeObj = product.size.find(s => s.name === item.size);
      if (sizeObj) sizePrice = sizeObj.price || 0;
    }
    if (Array.isArray(product.crust) && item.crust) {
      const crustObj = product.crust.find(c => c.name === item.crust);
      if (crustObj) crustPrice = crustObj.price || 0;
    }
    if (Array.isArray(product.extra) && Array.isArray(item.extras)) {
      extrasPrice = item.extras.reduce((sum, extraName) => {
        const extraObj = product.extra.find(e => e.name === extraName);
        return sum + (extraObj ? extraObj.price || 0 : 0);
      }, 0);
    }
    let price = basePrice + sizePrice + crustPrice + extrasPrice;
    if (product.discount > 0) price -= product.discount;
    return price * (item.quantity || 1);
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow md:grid md:grid-cols-[100px_1fr_auto] md:items-center md:gap-x-4 flex flex-col gap-4">
      {/* Ảnh sản phẩm */}
      <img src={item.imagePath} alt={item.productName} className="self-center object-cover w-20 h-20 rounded" />

      {/* Cột thông tin sản phẩm */}
      <div className="min-h-[80px] overflow-hidden">
        <h3 className="text-lg font-semibold break-words whitespace-normal">{item.productName}</h3>
        {item.size && item.size !== "" && product && (
          <p className="text-sm text-gray-500">Size: {item.size}</p>
        )}
        {item.crust && item.crust !== "" && product && (
          <p className="text-sm text-gray-500">Vỏ: {product.crust?.find(c => c.name === item.crust)?.name || item.crust}</p>
        )}
        {Array.isArray(item.extras) && item.extras.length > 0 && product && (
          <p className="text-sm text-gray-500">
            Thêm: {item.extras.map(e => product.extra?.find(ex => ex.name === e)?.name || e).join(", ")}
          </p>
        )}
      </div>

      {/* Cột giá và nút */}
      <div className="flex items-center justify-end gap-4 min-w-[300px] flex-wrap md:flex-nowrap">
        <span className="text-lg font-semibold text-red-600 whitespace-nowrap">
          {getItemPrice().toLocaleString("vi-VN")}₫
        </span>
        <button
          className="px-4 py-2 text-base font-semibold text-blue-600 hover:underline"
          onClick={() => openEditModal(item._id)}
        >
          Chỉnh sửa
        </button>
        <button
          onClick={() => {
            setItemToDelete(item._id);
            setShowDeleteModal(true);
          }}
          className="px-4 py-2 text-base font-semibold text-red-600 hover:underline"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

export default CartPage;