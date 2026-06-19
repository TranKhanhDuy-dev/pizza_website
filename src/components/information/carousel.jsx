import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../assets/css/carousel.css";
import Banner1 from "../../assets/images/banners/banner.png";
import Banner2 from "../../assets/images/banners/bannerDiscount.png";

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, zIndex: 10 }} // Thêm zIndex để mũi tên nổi lên trên ảnh
      onClick={onClick}
    >
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, zIndex: 10 }} // Thêm zIndex tương tự
      onClick={onClick}
    >
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </div>
  );
}

function Carousel() {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 800,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    appendDots: (dots) => (
      <div>
        <ul style={{ marginTop: "20px" }}>{dots}</ul>
      </div>
    ),
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  const slides = [
    {
      image: Banner1,
    },
    {
      image: Banner2,
    },
    {
      image: Banner1,
    },
  ];

  return (
    <section className="relative max-w-screen-lg">
        <Slider {...settings}>
            {slides.map((slide, index) => (
            <div key={index}>
            <div
              className="h-[50vh] w-full bg-cover bg-center flex items-center justify-center relative"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="relative z-10 max-w-2xl px-6 text-center text-white">
              </div>
            </div>
          </div>
            ))}
        </Slider>
    </section>
  );
}

export default Carousel;