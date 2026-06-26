import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import axios from 'axios';

import "./App.css";
import ScrollToTop from './components/support/scrollToTop.jsx';
import Navbar from "./components/navbar/navbar.jsx";
import Content from "./components/content/content.jsx";
import Footer from "./components/endpage/footer.jsx";
import Pizza from "./components/category/pizza.jsx";
import Chicken from "./components/category/chicken.jsx";
import Noodle from "./components/category/noodle.jsx";
import Drink from "./components/category/drink.jsx";
import Other from "./components/category/other.jsx";
import Cart from "./components/cart/cart.jsx";
import Profile from "./components/profile/profile.jsx";
import LoginModal from './components/navbar/loginView.jsx';
import Pay from "./components/pay/pay.jsx";
import AllProducts from "./components/information/allProducts.jsx";
import AllCombo from "./components/information/allCombo.jsx";
import AllDiscount from "./components/information/allDiscounts.jsx";
import Find from "./components/navbar/find.jsx";
import About from "./components/navbar/about.jsx";
import Chatbot from "./components/chatbot/chatbot.jsx";

function App() {
  const [dbStatus, setDbStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [type, setType] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [productCategories, setProductCategories] = useState([]);

  // Kiểm tra kết nối backend
  useEffect(() => {
  axios.get(`${import.meta.env.VITE_API_URL}/api/test-db`)
    .then(res => {
      setDbStatus(res.data.message);
      console.log("✅ Kết nối thành công backend:", res.data.message);
    })
    .catch(err => {
      setDbStatus("❌ Lỗi kết nối backend");
      console.error("❌ Lỗi kết nối backend:", err);
    });
  }, []);

  // Đọc user từ localStorage khi load lại trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedType = localStorage.getItem("userType");

    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
        } else {
          setUser(null);
          localStorage.removeItem("user"); // xóa nếu không đúng
        }
      }
    } catch (error) {
      console.error("Lỗi khi parse user từ localStorage:", error);
      localStorage.removeItem("user");
      setUser(null);
    }

    setType(storedType || null);
  }, []);

  // Đăng nhập thành công
  const handleLogin = (userData, userType) => {
    setUser(userData);
    setType(userType);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userType", userType);
    setShowLogin(false);
  };
  // Đăng xuất
  const handleLogout = () => {
    setUser(null);
    setType(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
  };

  return (
    <Router>
      <ScrollToTop />
        <Navbar
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          showLogin={showLogin}
          setShowLogin={setShowLogin}
        />

        <Routes>
          <Route path="/" element={<Content user={user} type={type} setShowLogin={setShowLogin}/>} />
          <Route path="/about" element={<About />} />
          <Route path="/pizza" element={<Pizza setShowLogin={setShowLogin}/>} />
          <Route path="/chicken" element={<Chicken user={user} setShowLogin={setShowLogin}/>} />
          <Route path="/noodle" element={<Noodle user={user} setShowLogin={setShowLogin} />} />
          <Route path="/drink" element={<Drink user={user}setShowLogin={setShowLogin} />} />
          <Route path="/other" element={<Other user={user}setShowLogin={setShowLogin}/>}/>
          <Route path="/cart" element={<Cart user={user} type={type} />} />
          <Route path="/profile" element={<Profile user={user} type={type} />} />
          <Route path="/pay" element={<Pay user={user} type={type} />} />
          <Route path="/products" element={<AllProducts user={user} type={type} setShowLogin={setShowLogin} />} />
          <Route path="/combo" element={<AllCombo user={user} setShowLogin={setShowLogin} />} />
          <Route path="/discounts" element={<AllDiscount setShowLogin={setShowLogin} />} />
          <Route path="/find" element={<Find user={user} type={type} setShowLogin={setShowLogin} />} />
        </Routes>
        <Chatbot/>
        <Footer />
        <LoginModal show={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
    </Router>
  );
}

export default App;
