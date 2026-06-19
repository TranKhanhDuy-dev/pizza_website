import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faMapMarkerAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="relative w-full p-4 text-gray-300 bg-[#FFB347] md:p-6">
      <div className="container pl-28 grid grid-cols-1 gap-x-4  mx-auto sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_0.8fr_1fr]">
        {/* Cột 1: Tên & Slogan */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left lg:col-span-1"> 
          <h3 className="mb-2 text-xl font-bold text-black">Cửa Hàng Pizza Murin</h3>
          <p className="text-sm text-[#5C4033]">
            Pizza tươi ngon, giao hàng tận nơi. Trải nghiệm hương vị Ý đích thực!
          </p>
        </div>

        {/* Cột 2: Bạn cần hỗ trợ */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left lg:col-span-1">
          <h4 className="mb-4 text-lg font-semibold text-black ">Liên hệ</h4>
          <p className="mb-1 text-base text-black group">
            <FontAwesomeIcon icon={faPhone} className="mr-2" />
            <Link to="/" className="text-black hover:text-[#5C4033] hover:underline">0122 768 126</Link>
          </p>
          <p className="mb-1 text-base text-black group">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
            <Link to="/" className="text-black hover:text-[#5C4033] hover:underline">736 Nguyễn Trãi, Phường 11, Quận 5, Tp.HCM</Link>
          </p>
          <p className="mb-4 text-base text-black group">
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            <Link to="/" className="text-black hover:text-[#5C4033] hover:underline">info@dhv.edu.vn</Link>
          </p>
        </div>

        {/* Cột 3: Về chúng tôi */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h4 className="mb-4 text-lg font-semibold text-black">Liên kết nhanh</h4>
          <p><Link to="/" className="block mb-1 text-base text-black hover:text-[#5C4033] hover:underline">Trang chủ</Link></p>
          <p><Link to="/about" className="block mb-1 text-base text-black hover:text-[#5C4033] hover:underline">Giới thiệu</Link></p>
          <p><Link to="/products" className="block mb-4 text-base text-black hover:text-[#5C4033] hover:underline">Thực đơn</Link></p>
        </div>

        {/* Cột 4: Kết nối với chúng tôi */}
        <div className="flex flex-col items-start -ml-20 text-center sm:items-start sm:text-left lg:col-span-1">
          <h4 className="mb-4 text-lg font-semibold text-black">Kết nối với chúng tôi</h4>
          <div className="flex space-x-5 text-3xl">
            <a 
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-black border border-black rounded-full hover:text-[#5C4033]" 
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a 
              href="https://facebook.com"
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-black border border-black rounded-full hover:text-[#5C4033]" 
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://instagram.com"
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-black border border-black rounded-full hover:text-[#5C4033]" 
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://tiktok.com"
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-black border border-black rounded-full hover:text-[#5C4033]" 
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      {/* Dòng Copyright */}
      <div className="pt-6 mt-8 text-sm text-[#5C4033] text-center border-t border-white border-opacity-20">
        <p>© {new Date().getFullYear()} Cửa Hàng Pizza Murin. Bảo lưu mọi quyền.</p>
        <p>Phát triển bởi Murin</p>
      </div>
    </footer>
  );
};

export default Footer;