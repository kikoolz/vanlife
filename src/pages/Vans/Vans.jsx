import React from "react";
import { getVans } from "../../api";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";

export function loader() {
  return getVans();
}

export default function Vans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const vans = useLoaderData(); // Now receives actual vans data
  const typeFilter = searchParams.get("type");

  // Remove useEffect since data is now loaded via loader

  // Filter vans based on typeFilter
  const displayedVans = typeFilter
    ? vans.filter((van) => van.type.toLowerCase() === typeFilter.toLowerCase())
    : vans;

  const vanElements = displayedVans.map((van) => (
    <div key={van.id} className="van-tile">
      <Link
        to={`/vans/${van.id}`}
        state={{ search: `?type=${typeFilter}`, type: typeFilter }}
        aria-label={`View details for ${van.name}, 
           priced at $${van.price} per day`}
      >
        <img src={van.imageUrl} alt={van.name} />
        <div className="van-info">
          <h2>{van.name}</h2>
          <p>
            ${van.price}
            <span>/day</span>
          </p>
        </div>
        <i className={`van-type ${van.type} selected`}>{van.type}</i>
      </Link>
    </div>
  ));

  return (
    <div className="van-list-container">
      <h1>Explore our van options</h1>
      <div className="van-list-filter-buttons">
        <button
          onClick={() => setSearchParams({ type: "simple" })}
          className={`van-type simple ${
            typeFilter === "simple" ? "selected" : ""
          }`}
        >
          Simple
        </button>
        <button
          onClick={() => setSearchParams({ type: "luxury" })}
          className={`van-type luxury ${
            typeFilter === "luxury" ? "selected" : ""
          }`}
        >
          Luxury
        </button>
        <button
          onClick={() => setSearchParams({ type: "rugged" })}
          className={`van-type rugged ${
            typeFilter === "rugged" ? "selected" : ""
          }`}
        >
          Rugged
        </button>
        {typeFilter && (
          <button
            onClick={() => setSearchParams({})}
            className="van-type clear-filters"
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="van-list">{vanElements}</div>
    </div>
  );
}
