import { Link, useLocation, useLoaderData } from "react-router-dom";
import { getVans } from "../../api";
import BookingForm from "../../components/BookingForm";
import OptimizedImage from "../../components/OptimizedImage";

export function loader({ params }) {
  return getVans(params.id);
}

export default function VanDetail() {
  const location = useLocation();
  const van = useLoaderData();

  const search = location.state?.search || "";
  const type = location.state?.type || "all";

  return (
    <div className="van-detail-container">
      <Link to={`..${search}`} relative="path" className="back-button">
        &larr; <span>Back to {type} vans</span>
      </Link>

      <div className="van-detail">
        <OptimizedImage src={van.imageUrl} alt={`${van.name} van exterior`} />
        <i className={`van-type ${van.type} selected`}>{van.type}</i>
        <h2>{van.name}</h2>
        <p className="van-price">
          <span>${van.price}</span>/day
        </p>
        <p>{van.description}</p>
        <BookingForm van={van} />
      </div>
    </div>
  );
}
