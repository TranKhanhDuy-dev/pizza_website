import React from "react";
import Category from "../category/category.jsx";
import Carousel from "../information/carousel.jsx";
import Combo from "../information/combo.jsx";
import Discount from "../information/discount.jsx";
import Product from "../information/product.jsx";

const Content = ({ user, type, setShowLogin}) => {
    return (
    <>
        <div className="flex flex-grow w-full pb-4 pl-4 bg-white md:pl-24">
          <Category /> {/* Cột trái cố định */}
          {/* Cột phải */}
          <div className="w-full md:w-[80%] md:pt-[22px]">
            <Carousel />
            <Combo user={user} type={type} setShowLogin={setShowLogin}/>
            <Discount user={user} type={type} setShowLogin={setShowLogin}/>
            <Product user={user} type={type} setShowLogin={setShowLogin}/>
          </div>
        </div>
    </>
    );
}
export default Content;