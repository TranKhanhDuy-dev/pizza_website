import { useNavigate } from "react-router-dom";
const About = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-start w-full pt-10 pb-20 text-gray-800 bg-white pl-36 items-left">
      {/* Hero Section */}
      <section className="w-full mb-16 text-center max-w-9xl">
        <h1 className="text-4xl font-bold text-[#e50914] mb-4 pr-28">Câu chuyện thương hiệu của chúng tôi</h1>
        <p className="text-lg text-gray-600 pr-28">
          Chúng tôi bắt đầu với một niềm đam mê đơn giản: mang đến những chiếc pizza chất lượng nhất đến mọi gia đình.
        </p>
      </section>

      {/* Brand Story */}
      <section className="w-full max-w-[1200px] mb-16 space-y-8">
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Nguồn gốc và Sứ mệnh</h2>
          <p>
            Được thành lập vào năm 2024, thương hiệu của chúng tôi ra đời với mục tiêu cung cấp những chiếc pizza thơm ngon,
            nguyên liệu sạch và chất lượng cao, phục vụ nhanh chóng và tận tâm. Chúng tôi tin rằng mỗi bữa ăn là một khoảnh khắc đáng nhớ bên gia đình và bạn bè.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Hành trình phát triển</h2>
          <p>
            Từ một niềm đam mê mãnh liệt với món ăn pizza chúng tôi đã quyết tâm mở một cửa tiệm để tạo ra những chiếc pizza ngon lành nhất để đem đến cho cộng đồng.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Tầm nhìn tương lai</h2>
          <p>
            Chúng tôi hướng đến trở thành chuỗi pizza hàng đầu tại Việt Nam, đồng thời đẩy mạnh chuyển đổi số và mang lại trải nghiệm đặt hàng tiện lợi nhất cho khách hàng.
          </p>
        </div>
      </section>

      {/* Differentiators */}
      <section className="w-full max-w-[1200px] mb-16 space-y-8">
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Điểm mạnh và Lợi thế cạnh tranh</h2>
          <p>
            Nguyên liệu được tuyển chọn kỹ lưỡng, đế bánh nướng theo công thức độc quyền, dịch vụ giao hàng nhanh và thân thiện là những yếu tố giúp chúng tôi khác biệt.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Giá trị mang lại cho khách hàng</h2>
          <p>
            Không chỉ là pizza ngon, chúng tôi mang đến sự tiện lợi, niềm vui trong từng lần thưởng thức và cảm giác được trân trọng.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Cam kết chất lượng</h2>
          <p>
            Tất cả sản phẩm đều được kiểm tra nghiêm ngặt trước khi đến tay khách hàng. Chúng tôi luôn lắng nghe phản hồi để ngày càng hoàn thiện hơn.
          </p>
        </div>
      </section>

      {/* Trust & People */}
      <section className="w-full max-w-[1200px] mb-16 space-y-8">
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Đội ngũ của chúng tôi</h2>
          <p>
            Chúng tôi là một tập thể trẻ trung, năng động, tận tâm. Mỗi chiếc pizza là thành quả của tình yêu nghề và sự chuyên nghiệp.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Chứng nhận & Giải thưởng</h2>
          <p>
            Đạt chứng nhận vệ sinh an toàn thực phẩm cấp quốc gia năm 2025.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-[1200px] text-center">
        <h2 className="mb-4 text-2xl font-bold">Cùng nhau tạo nên hành trình ẩm thực tuyệt vời!</h2>
        <button
        onClick={() => navigate("/products")}
        className="px-6 py-3 text-white bg-[#e50914] rounded hover:bg-red-500 transition"
        >
        Khám phá Menu
        </button>
      </section>
    </div>
  );
};

export default About;
