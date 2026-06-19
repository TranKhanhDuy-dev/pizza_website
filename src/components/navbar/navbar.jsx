import React, { useState, useCallback } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import Logo from "../../assets/images/logo.png";
import Cart from "../../assets/images/shoppingCart.png";
import LoginModal from "./loginView.jsx";
import RegisterModal from "./registerView.jsx";

// Đổi tên component thành Header cho nhất quán
const Navbar = ({ user, onLogin, onLogout}) => {
    // --- State và Hooks ---
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showCategory, setShowCategory] = useState(false);

  
    // Hàm debounce để không gọi search liên tục khi người dùng gõ
    const handleSearch = useCallback(
      debounce((value) => {
        console.log("Bắt đầu tìm kiếm với từ khóa:", value);
      }, 500), // Chờ 500ms sau khi người dùng ngừng gõ
      [navigate]
    );
  
    // Hàm xử lý khi thay đổi nội dung ô tìm kiếm
    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      handleSearch(value);
    };

    // Hàm xử lý khi nhấn nút tìm kiếm
    const handleSearchButtonClick = () => {
      handleSearch.flush();
      if (searchTerm.trim()) {
        navigate(`/find?q=${encodeURIComponent(searchTerm.trim())}`);
      }
    };

    // Hàm điều hướng đến giỏ hàng
    const handleCartClick = () => {
      navigate("/cart"); 
      setShowMenu(false);
    };

    const handleCategoryItemClick = (path) => {
      navigate(`/${path}`);
      setShowMenu(false);
      setShowCategory(false);
    };

    const toggleCategoryMenu = () => {
      setShowCategory(!showCategory);
    };
    
    //Hàm xử lý đăng ký
    const handleRegisterData = async (data) => {
      const result = Register(data);
  
      if (!result.success) {
        return result;
      }
      return true;
    };
    
    return (
      <>
        <header className="w-full bg-[#FFB347] shadow-md sticky top-0 z-50">
          <div className="container flex items-end justify-center px-6 py-3 mx-auto">
            <div className="flex items-end space-x-10 transform md:mr-14 ">

              {/* Cụm BÊN TRÁI: Đã chuyển thành button */}
              <div className="flex items-end">
                <button onClick={() => navigate('/')} className="flex items-center">
                  <img 
                    src={Logo} 
                    alt="Logo Cửa Hàng - Về trang chủ" 
                    className="w-auto h-20" 
                  />
                </button>
                <nav className="flex ml-6 space-x-3">
                  <button 
                    onClick={() => navigate('/')}
                    className="pb-2 text-base text-black hover:text-[#5C4033] hover:underline"
                  >
                    Trang chủ
                  </button>
                  <button 
                    onClick={() => navigate('/about')}
                    className="pb-2 text-base text-black hover:text-[#5C4033] hover:underline"
                  >
                    Về chúng tôi
                  </button>
                </nav>
              </div>

              {/* Cụm TRUNG TÂM: hàm xử lý tìm kiếm */}
              <div className="flex-col items-center flex-grow hidden md:flex ">
                <h1 className="mb-2 text-2xl font-bold text-[#2F2F2F]">Cửa Hàng Pizza Murin</h1>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="h-10 w-[520px] rounded-l-full border border-gray-300 px-4 py-2 focus:outline-none"
                  />
                  <button 
                    onClick={handleSearchButtonClick}
                    className="flex items-center justify-center h-10 px-4 text-white bg-[#e50914] rounded-r-full shadow-md hover:bg-red-500"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {/* Cụm BÊN PHẢI:hàm và hiển thị có điều kiện */}
              <div className="items-end hidden space-x-4 md:flex">
                  <button
                    className="px-4 py-2 text-base text-white bg-white rounded-full hover:bg-gray-700 hover:bg-opacity-20"
                    onClick={handleCartClick}
                    aria-label="Giỏ hàng"
                  >
                    <img
                      src={Cart}
                      alt="Shopping Cart - Về giỏ hàng"
                      className="h-[26px] w-auto object-contain cursor-pointer"
                    />
                  </button>
                  
                  {user ? (
                    // Nếu người dùng đã đăng nhập
                    <>
                      <Link to="/profile">
                        <img
                          src={user.avatarPath}
                          alt="Avatar"
                          className="object-cover w-10 h-10 rounded-full cursor-pointer"
                        />
                      </Link>
                      <button 
                        onClick={onLogout}
                        className="pl-6 pb-2 text-base text-black hover:text-[#5C4033] hover:underline"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    // Nếu người dùng chưa đăng nhập
                    <>
                      <button 
                        className="pb-2 text-base text-black hover:text-[#5C4033] hover:underline"
                        onClick={() => {
                          setShowLogin(true);
                          setShowRegister(false);
                          setShowMenu(false);
                        }}
                      >
                        Đăng nhập
                      </button>
                      <button 
                        className="pb-2 text-base text-black hover:text-[#5C4033] hover:underline"
                        onClick={() => {
                          setShowRegister(true);
                          setShowLogin(false);
                          setShowMenu(false);
                        }}
                      >
                        Đăng ký
                      </button>
                    </>
                    
                  )}
              </div>
              <button
                className="flex items-center justify-center p-2 rounded md:hidden focus:outline-none"
                onClick={() => {
                    setShowMenu(!showMenu); // Toggle main menu
                    setShowCategory(false); // Close category menu when main menu is toggled
                }}
              >
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

            </div>
          </div>
          {/* Menu dropdown cho mobile */}
          {showMenu && (
          <div className="absolute left-0 z-40 w-full bg-[#FFB347] border border-gray-200 shadow-md top-full rounded-b-md md:hidden">
            <div className="p-2 space-y-2">
              <button
                onClick={handleCartClick}
                className="block w-full px-4 py-2 text-base text-left text-gray-800 hover: bg-[#FFB347]"
              >
                Giỏ hàng
              </button>

              {/* Dropdown danh mục */}
              <div className="relative">
                <button
                  onClick={toggleCategoryMenu}
                  className="flex items-center justify-between w-full px-4 py-2 text-base text-left text-gray-800 hover:bg-[#FFB347]"
                >
                  Danh mục
                  <svg className={`w-4 h-4 transform ${showCategory ? 'rotate-180' : 'rotate-0'}`} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown cấp 2 */}
                {showCategory && (
                  <div className="absolute left-0 z-50 w-56 mt-1 ml-4 bg-[#FFB347] border-gray-200 rounded-md shadow">
                    <div className="absolute w-3 h-3 transform rotate-45 bg-[#FFB347] border-l border-gray-200 -top-1 left-6"></div>
                    <div className="py-2">
                      <button onClick={() => handleCategoryItemClick('pizza')} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FFB347]">
                        Pizza
                      </button>
                      <button onClick={() => handleCategoryItemClick('chicken')} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FFB347]">
                        Gà
                      </button>
                      <button onClick={() => handleCategoryItemClick('noodle')} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FFB347]">
                        Mỳ ý
                      </button>
                      <button onClick={() => handleCategoryItemClick('drink')} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FFB347]">
                        Thức uống
                      </button>
                      <button onClick={() => handleCategoryItemClick('other')} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-[#FFB347]">
                        Khác
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tài khoản */}
              {user ? (
                <>
                  <Link to="/profile" className="block w-full px-4 py-2 text-base text-left text-gray-800 hover:bg-gray-100">
                    Hồ sơ cá nhân
                  </Link>
                  <button onClick={onLogout} className="block w-full px-4 py-2 text-base text-left text-gray-800 hover:bg-gray-100">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setShowLogin(true); setShowRegister(false); setShowMenu(false); setShowCategory(false); }}
                    className="block w-full px-4 py-2 text-base text-left text-gray-800 hover:bg-gray-100"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { setShowRegister(true); setShowLogin(false); setShowMenu(false); setShowCategory(false); }}
                    className="block w-full px-4 py-2 text-base text-left text-gray-800 hover:bg-gray-100"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
          )}
        </header>
        {/* Modal Đăng nhập */}
          <LoginModal
            show={showLogin}
            onClose={() => setShowLogin(false)}
            onLogin={onLogin}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />

          {/* Modal Đăng ký */}
          <RegisterModal
            show={showRegister}
            onClose={() => setShowRegister(false)}
            onRegister={handleRegisterData}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
      </>
  );
};

export default Navbar;