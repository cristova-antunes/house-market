import { Link } from "react-router-dom";

import rentCategoryImg from "../assets/jpg/rentCategoryImage.jpg";
import saleCategoryImg from "../assets/jpg/sellCategoryImage.jpg";

export default function Explore() {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>

      <main>
        {/* SLIDER */}

        <p className="exploreCategoryHeader">Categories</p>

        <div className="exploreCategories">
          <Link to="/category/rent">
            <img
              src={rentCategoryImg}
              alt="rent"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Places for rent</p>
          </Link>

          <Link to="/category/sale">
            <img
              src={saleCategoryImg}
              alt="sale"
              className="exploreCategoryImg"
            />

            <p className="exploreCategoryName">Places for sale</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
