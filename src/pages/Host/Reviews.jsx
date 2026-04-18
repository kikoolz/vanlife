export default function Reviews() {
  const reviews = [
    {
      id: 1,
      author: "Elliot",
      date: "December 1, 2022",
      rating: 5,
      text: "The beach bum is such as awesome van! Such as comfortable trip. We had it for 2 weeks and there was not a single issue. Super clean when we picked it up and the host is very comfortable and understanding. Highly recommend!",
    },
    {
      id: 2,
      author: "Sandy",
      date: "November 23, 2022",
      rating: 5,
      text: "This is our third time using the Modest Explorer for our travels and we love it! No complaints, absolutely perfect!",
    },
  ];

  const ratingDistribution = {
    5: 100,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>Your reviews</h1>
        <p className="reviews-period">last 30 days</p>
      </div>

      <div className="overall-rating">
        <div className="rating-number">5.0</div>
        <span className="star filled">★</span>
        <span className="overall-text">overall rating</span>
      </div>

      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="distribution-row">
            <span className="star-count">
              {stars} star{stars !== 1 ? "s" : ""}
            </span>
            <div className="distribution-bar-container">
              <div
                className={`distribution-bar ${stars === 5 ? "filled" : ""}`}
                style={{ width: `${ratingDistribution[stars]}%` }}
                role="meter"
                aria-label={`${stars} star rating distribution`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={ratingDistribution[stars]}
              ></div>
            </div>
            <span className="percentage">{ratingDistribution[stars]}%</span>
          </div>
        ))}
      </div>

      <div className="reviews-list">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              {renderStars(review.rating)}
              <div className="review-info">
                <strong>{review.author}</strong>
                <span className="review-date">{review.date}</span>
              </div>
            </div>
            <p className="review-text">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
