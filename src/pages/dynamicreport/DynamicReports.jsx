import { Fragment, useState } from "react";
import { useNavigate } from "react-router";

const themes = [
  {
    id: 1,
    label: "Elegant - Wedding",
    type: "full",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80",
  },
  {
    id: 2,
    label: "Basic - Dark",
    type: "full",
    image:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80",
  },
  {
    id: 3,
    label: "Elegant - Wedding",
    type: "full",
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80",
  },
  {
    id: 4,
    label: "Elegant - Wedding",
    type: "full",
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80",
  },
];

const ThemeCard = ({ theme }) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  if (theme.type === "full") {
    return (
      <div
        className="relative w-full h-[250px] overflow-hidden rounded-t-md cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <img
          src={theme.image}
          alt={theme.label}
          className="w-full h-full object-cover"
        />

        {/* Dark overlay on hover */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* View btn — top-right corner */}
        <div
          className={`absolute top-3 right-3 transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button className="bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-colors">
            View
          </button>
        </div>

        {/* Customise btn — centered */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            className="bg-primary hover:opacity-90 text-white text-xs font-semibold px-6 py-2 rounded-full shadow-md transition-opacity"
            onClick={() => {
              navigate("/reportcustomise");
            }}
          >
            Customise
          </button>
        </div>
      </div>
    );
  }

  return null;
};

const Container = ({ children }) => <div className="px-4">{children}</div>;

const ReportThemes = () => {
  return (
    <Fragment>
      <Container>
        <div>
          <div className="mb-4">
            <h2 className="text-black text-2xl">Report Themes</h2>
            <p className="text-gray-800 text-sm mt-0.5">
              Discover unique designs, crafted for your reports.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2].map((row) =>
              themes.map((theme) => (
                <div key={`${row}-${theme.id}`} className="flex flex-col">
                  <ThemeCard theme={theme} />
                  <p className="p-3 text-center bg-primary text-white text-sm rounded-b-md">
                    {theme.label}
                  </p>
                </div>
              )),
            )}
          </div>

          <div className="flex justify-center mt-6">
            <button className="bg-primary text-white text-xs font-medium px-5 py-2 rounded-full transition-colors">
              See More
            </button>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default ReportThemes;
