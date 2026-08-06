import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import jwt from 'jsonwebtoken';

function getUserIdFromToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || decoded.id;
  } catch (error) {
    return null;
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const reviewerId = getUserIdFromToken(req);
    if (!reviewerId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reviewee, rating, review } = body;

    if (!reviewee || !rating || !review) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (review.length > 300) {
      return NextResponse.json({ success: false, message: 'Review cannot exceed 300 characters' }, { status: 400 });
    }

    if (reviewerId.toString() === reviewee.toString()) {
      return NextResponse.json({ success: false, message: 'You cannot review yourself' }, { status: 400 });
    }

    const existingReview = await Review.findOne({ reviewer: reviewerId, reviewee });
    if (existingReview) {
      return NextResponse.json({ success: false, message: 'You have already reviewed this user.' }, { status: 400 });
    }

    const newReview = await Review.create({
      reviewer: reviewerId,
      reviewee,
      rating,
      review
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'You have already reviewed this user.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name email profilePic')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
export async function PUT(req) {
  try {
    await dbConnect();

    const reviewerId = getUserIdFromToken(req);
    if (!reviewerId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reviewee, rating, review, reviewId } = await req.json();

   const updatedReview = await Review.findOneAndUpdate(
  {
    _id: reviewId,
    reviewer: reviewerId
  },
  {
    rating,
    review
  },
  {
    new: true
  }
);

    if (!updatedReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedReview
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}