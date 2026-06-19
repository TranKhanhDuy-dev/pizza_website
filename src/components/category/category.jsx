import React from "react";
import { Link } from "react-router-dom";

const Category = () => {
  return (
    <div className="hidden md:block w-[15%]">
      <div className="sticky w-[70%] mx-auto top-[100px] z-30 bg-white max-h-[calc(100vh-80px)] rounded py-4">
        <div className="flex flex-col items-center justify-start w-full px-0 pb-1 overflow-y-auto text-white">
          <h1 className="w-full max-w-xs px-2 mb-2 text-lg font-bold text-black">
            Danh mục
          </h1>
          <ul className="grid w-full max-w-xs grid-cols-1 gap-2 px-2 list-none">
            <li className="p-2 transition-all duration-200 bg-[#e50914] rounded-full shadow-md hover:bg-red-500">
              <Link to="/pizza">
                <p className="m-0 text-base font-semibold text-center"> Pizza</p>
              </Link>
            </li>
            <li className="p-2 transition-all duration-200 bg-[#e50914] rounded-full shadow-md hover:bg-red-500">
              <Link to="/chicken">
                <p className="m-0 text-base font-semibold text-center">Gà Rán</p>
              </Link>
            </li>
            <li className="p-2 transition-all duration-200 bg-[#e50914] rounded-full shadow-md hover:bg-red-500">
              <Link to="/noodle">
                <p className="m-0 text-base font-semibold text-center">Mì</p>
              </Link>
            </li>
            <li className="p-2 transition-all duration-200 bg-[#e50914] rounded-full shadow-md hover:bg-red-500">
              <Link to="/drink">
                <p className="m-0 text-base font-semibold text-center">Thức Uống</p>
              </Link>
            </li>
            <li className="p-2 transition-all duration-200 bg-[#e50914] rounded-full shadow-md hover:bg-red-500">
              <Link to="/other">
                <p className="m-0 text-base font-semibold text-center">Khác</p>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Category;