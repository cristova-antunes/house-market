import { Link } from "react-router-dom";
import { ReactComponent as DeleteIcon } from "../assets/svg/deleteIcon.svg";
import bedIcon from "../assets/svg/bedIcon.svg";
import bathIcon from "../assets/svg/bathtubIcon.svg";

export default function ListingItem({ listing, id, onDelete }) {
  const formatPrice = (value) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <li className="categoryListing">
      <Link
        to={`category/${listing.type}/${id}`}
        className="categoryListingLink"
      >
        <img
          src={listing.imageUrls[0]}
          alt={listing.name}
          className="categoryListingImg"
        />

        <div className="categoryListingDetails">
          <p className="categoryListingLocation">{listing.location}</p>
          <p className="categoryListingName">{listing.name}</p>
          <p className="categoryListingPrice">
            $
            {listing.offer
              ? formatPrice(listing.discountedPrice)
              : formatPrice(listing.regularPrice)}
            {listing.type === "rent" && " / Month"}
          </p>

          <div className="categoryListingInfoDiv">
            <img src={bedIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {listing.bedrooms > 1
                ? `${listing.bedrooms} Bedroom`
                : "1 Bedroom"}
            </p>

            <img src={bathIcon} alt="bathroom" />
            <p className="categoryListingInfoText">
              {listing.bathroom > 1
                ? `${listing.bathroom} Bathrooms`
                : "1 Bathroom"}
            </p>
          </div>
        </div>
      </Link>

      {onDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231,76,60"
          onClick={onDelete(listing.id, listing.name)}
        />
      )}
    </li>
  );
}
