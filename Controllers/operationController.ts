import { AppError } from '../Utils/appError';
import catchAsync from '../Utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { APIFeatures } from '../Utils/apiFeatures';

const deleteOne = (model: mongoose.Model<any, any, any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tour = await model.findByIdAndRemove(req.params.id);
    if (!tour) {
      return next(new AppError('No tour found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
    });
  });
const updateOne = (model: mongoose.Model<any, any, any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  });
const createOne = (model: mongoose.Model<any, any, any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newDoc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newDoc,
    });
  });
const getOne = (model: mongoose.Model<any, any, any>, popOptions?: { path: string; select?: string } | string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    let doc = await query;
    if (!doc) {
      return next(new AppError('No tour found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      date: doc,
    });
  });
const getAll = (model: mongoose.Model<any, any, any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //for nested route between tours and reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(model.find(filter), req.query).filter().limitingFields().sort().pagination();
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      docs,
    });
  });
export { deleteOne, updateOne, createOne, getOne, getAll };
