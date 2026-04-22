import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { getVans } from "../../api";
import { useState, Suspense } from "react";
import { SkeletonVanCard } from "../../components/Skeleton";
import OptimizedImage from "../../components/OptimizedImage";
import { requireAuth } from "../../utils";

const FILTER_TYPES = ["simple", "luxury", "rugged"];

export async function loader({ request }) {
  await requireAuth({ request });
  return getVans();
}

export default function Vans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const vans = useLoaderData();
  const typeFilter = searchParams.get("type");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const searchTerm = searchParams.get("search");
  const [priceRange, setPriceRange] = useState({ min: minPrice || "", max: maxPrice || "" });
  const [searchInput, setSearchInput] = useState(searchTerm || "");

  const displayedVans = vans.filter((van) => {
    const typeMatch = typeFilter ? van.type.toLowerCase() === typeFilter.toLowerCase() : true;
    const minPriceMatch = priceRange.min ? van.price >= parseFloat(priceRange.min) : true;
    const maxPriceMatch = priceRange.max ? van.price <= parseFloat(priceRange.max) : true;
    const searchMatch = searchTerm 
      ? van.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        van.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return typeMatch && minPriceMatch && maxPriceMatch && searchMatch;
  });

  const handlePriceRangeChange = (field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
  };

  const applyPriceFilter = () => {
    const newParams = {};
    if (typeFilter) newParams.type = typeFilter;
    if (priceRange.min) newParams.minPrice = priceRange.min;
    if (priceRange.max) newParams.maxPrice = priceRange.max;
    if (searchInput) newParams.search = searchInput;
    setSearchParams(newParams);
  };

  const clearPriceFilter = () => {
    setPriceRange({ min: "", max: "" });
    setSearchInput("");
    const newParams = {};
    if (typeFilter) newParams.type = typeFilter;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyPriceFilter();
  };

  const vanElements = displayedVans.map((van) => (
    <div key={van.id} className="van-tile">
      <Link
        to={`/vans/${van.id}`}
        state={{ search: typeFilter ? `?type=${typeFilter}` : "", type: typeFilter }}
        aria-label={`View details for ${van.name}, priced at $${van.price} per day`}
      >
        <OptimizedImage src={van.imageUrl} alt={van.name} />
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
      <form onSubmit={handleSearchSubmit} className="search-bar">
        <input
          type="text"
          placeholder="Search vans by name or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              const newParams = {};
              if (typeFilter) newParams.type = typeFilter;
              if (priceRange.min) newParams.minPrice = priceRange.min;
              if (priceRange.max) newParams.maxPrice = priceRange.max;
              setSearchParams(newParams);
            }}
            className="clear-search"
          >
            Clear
          </button>
        )}
      </form>
      <div className="van-list-filter-buttons">
        {FILTER_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSearchParams({ type })}
            className={`van-type ${type} ${
              typeFilter === type ? "selected" : ""
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        {typeFilter ? (
          <button
            onClick={() => setSearchParams({})}
            className="van-type clear-filters"
          >
            Clear filters
          </button>
        ) : null}
      </div>
      <div className="price-range-filter">
        <div className="price-range-inputs">
          <div className="price-input-group">
            <label htmlFor="minPrice">Min Price ($)</label>
            <input
              type="number"
              id="minPrice"
              min="0"
              step="1"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="price-input-group">
            <label htmlFor="maxPrice">Max Price ($)</label>
            <input
              type="number"
              id="maxPrice"
              min="0"
              step="1"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              placeholder="Any"
            />
          </div>
        </div>
        <div className="price-range-actions">
          <button
            onClick={applyPriceFilter}
            className="apply-price-filter"
          >
            Apply
          </button>
          {(priceRange.min || priceRange.max) && (
            <button
              onClick={clearPriceFilter}
              className="clear-price-filter"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <Suspense fallback={<div className="van-list">{Array.from({ length: 6 }).map((_, i) => <SkeletonVanCard key={i} />)}</div>}>
        <div className="van-list">{vanElements}</div>
      </Suspense>
    </div>
  );
}
