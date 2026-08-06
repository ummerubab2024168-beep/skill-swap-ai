'use client';

import React, { useState } from 'react';

export default function ReviewForm({
  revieweeId,
  existingReview = null,
  onReviewSubmitted,
}) {
 const [rating, setRating] = useState(existingReview?.rating || 0);
const [hover, setHover] = useState(0);
const [reviewText, setReviewText] = useState(existingReview?.review || '');
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rating) {
      setError('Rating is required.');
      return;
    }

    if (!reviewText.trim()) {
      setError('Review is required.');
      return;
    }

    if (reviewText.length > 300) {
      setError('Review cannot exceed 300 characters.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
  setError('Please login first.');
  return;
}

      const res = await fetch('/api/reviews', {
  method: existingReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
  reviewee: revieweeId,
  rating,
  review: reviewText,
  reviewId: existingReview?._id
})
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setSuccess(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      if (!existingReview) {
  setRating(0);
  setReviewText('');
}

      if (onReviewSubmitted) {
        onReviewSubmitted?.(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold text-purple-900">
    {existingReview ? "Edit Review" : "Leave a Review"}
  </h3>

  {existingReview && (
    <button
      type="button"
      onClick={() => {
        setRating(existingReview.rating);
        setReviewText(existingReview.review);
      }}
      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
    >
      Edit
    </button>
  )}
</div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Rating</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-2xl focus:outline-none transition-colors ${
                  (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Review</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="3"
            maxLength={300}
            placeholder="Write your review here (max 300 characters)..."
            className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 text-sm resize-none"
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {reviewText.length}/300 characters
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}