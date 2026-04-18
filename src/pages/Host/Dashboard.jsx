import { Link, useLoaderData } from "react-router-dom";
import { getHostVans, getHostIncome, getHostReviews } from "../../api";
import { requireAuth } from "../../utils";

export async function loader({ request }) {
  await requireAuth({ request });
  const vans = await getHostVans();
  const income = await getHostIncome();
  const reviews = await getHostReviews();

  return { vans, income, reviews };
}

export default function Dashboard() {
  const { vans, income, reviews } = useLoaderData();

  const displayedVans = vans.slice(0, 3);

  const vanElements = displayedVans.map((van) => (
    <div key={van.id} className="dashboard-van-item">
      <div className="dashboard-van-info">
        <img src={van.imageUrl} alt={van.name} />
        <div className="dashboard-van-details">
          <h3>{van.name}</h3>
          <p>${van.price}/day</p>
        </div>
      </div>
      <Link to={`/host/vans/${van.id}`} className="dashboard-van-edit">
        Edit
      </Link>
    </div>
  ));

  return (
    <div className="dashboard-container">
      <h1>Welcome!</h1>

      <div className="dashboard-income-section">
        <div>
          <h3>Income last 30 days</h3>
          <p className="dashboard-income-amount">${income.toLocaleString()}</p>
        </div>
        <Link to="/host/income" className="dashboard-link">
          Details
        </Link>
      </div>

      <div className="dashboard-reviews-section">
        <div className="dashboard-reviews-info">
          <h3>Review score</h3>
          <span className="dashboard-star">⭐</span>
          <span>
            {reviews.score.toFixed(1)}/{reviews.total}
          </span>
        </div>
        <Link to="/host/reviews" className="dashboard-link">
          Details
        </Link>
      </div>

      <div className="dashboard-vans-section">
        <h2>
          Your listed vans
          <Link to="/host/vans" className="dashboard-link">
            View all
          </Link>
        </h2>
        <div>{vanElements}</div>
      </div>
    </div>
  );
}
