import { Link } from "react-router-dom";
const MobileCategory = ({ onCategoryClick }) => {
  const categories = [
    { id: 1, name: "Pizza", path: "/pizza" },
    { id: 2, name: "Gà Rán", path: "/chicken" },
    { id: 3, name: "Mì", path: "/noodle" },
    { id: 4, name: "Thức Uống", path: "/drink" },
    { id: 5, name: "Khác", path: "/other" },
  ];

  return (
    <div className="w-48 bg-[#936B6B] text-white shadow-md">
      <div className="flex flex-col p-4">
        <ul className="grid w-full grid-cols-1 gap-2 list-none">
          {categories.map((category) => (
            <li key={category.id}
            className="active:bg-blue-300"
            >
              <Link
                to={category.path}
                className="px-4 py-2 text-xl text-white"
                onClick={onCategoryClick}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default MobileCategory;