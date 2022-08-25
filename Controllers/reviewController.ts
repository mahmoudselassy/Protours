import { Request, Response, NextFunction } from 'express';
import { Review } from '../Models/reviewModel';
import catchAsync from '../Utils/catchAsync';
import { createOne, deleteOne, updateOne, getOne, getAll } from './operationController';

const getAllReviews = getAll(Review);

const setIds = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.tourId) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = (req as any).user.id;
  next();
};

const createReview = createOne(Review);

const getReview = getOne(Review);

const deleteReview = deleteOne(Review);

const updateReview = updateOne(Review);

export { getAllReviews, createReview, getReview, deleteReview, updateReview, setIds };
