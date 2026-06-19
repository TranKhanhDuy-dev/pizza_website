import React from 'react';
import { Outlet } from 'react-router-dom';
import Category from "./components/category/category.jsx";

const Layout = () => {
  return (
    <div className="flex flex-grow w-full bg-white">
      <Category />
      <div className="w-full md:w-[70%] md:pt-[128px]">
        <Outlet /> {/* Nơi tự động render Content, Pizza, Chicken, v.v. */}
      </div>
    </div>
  );
};

export default Layout;