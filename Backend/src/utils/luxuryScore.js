/**
 * Luxury Score System (0–100)
 *
 * Weighted breakdown:
 *   Brand Value   — 35 pts  (brand prestige tier)
 *   Price         — 25 pts  (log-scaled, max at $50,000+)
 *   Reviews       — 25 pts  (avg rating + review count confidence)
 *   Material/Cat  — 15 pts  (category prestige weight)
 */

const BRAND_SCORES = {
  'Hermès':        35,
  'Chanel':        33,
  'Rolex':         33,
  'Louis Vuitton': 30,
  'Prada':         26,
  'Gucci':         24,
  'Dyson':         22,
};

const CATEGORY_SCORES = {
  'Watches':     15,
  'Jewellery':   14,
  'Handbags':    13,
  'Electronics': 12,
  'Shoes':       10,
  'Accessories':  8,
};

function calculateLuxuryScore({ brand, price, rating, numReviews, category }) {
  // 1. Brand score (0–35)
  const brandScore = BRAND_SCORES[brand] || 18;

  // 2. Price score (0–25) — log scale, caps at $50,000
  const priceScore = Math.min(25, Math.round(
    (Math.log10(Math.max(price, 1)) / Math.log10(50000)) * 25
  ));

  // 3. Review score (0–25)
  let reviewScore = 0;
  if (numReviews > 0) {
    const ratingPts     = (rating / 5) * 20;
    const confidencePts = Math.min(5, numReviews * 0.5);
    reviewScore = Math.round(ratingPts + confidencePts);
  }

  // 4. Category / material score (0–15)
  const categoryScore = CATEGORY_SCORES[category] || 8;

  const total = Math.min(100, brandScore + priceScore + reviewScore + categoryScore);

  return {
    total,
    breakdown: {
      brand:    brandScore,
      price:    priceScore,
      reviews:  reviewScore,
      material: categoryScore,
    },
  };
}

module.exports = calculateLuxuryScore;
