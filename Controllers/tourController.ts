import { Request, Response, NextFunction } from 'express';
import { connect } from 'http2';
import { Tour } from '../Models/tourModel';
import { AppError } from '../Utils/appError';
import catchAsync from '../Utils/catchAsync';
import { deleteOne, updateOne, createOne, getOne, getAll } from './operationController';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
//const tours: any[] = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`).toString());
const storage = multer.memoryStorage();

const fileFilter = (request: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new AppError('Please upload only images', 400) as any, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

const resizeTourImages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!(req.files as any).imageCover || !(req.files as any).images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp((req.files as any).imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  await Promise.all(
    (req.files as any).images.map(async (file: { buffer: Buffer }, i: number) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );
});

const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
const getAllTours = getAll(Tour);
const getMonthlyPlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    plan,
  });
});
const getToursStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await Tour.aggregate([
    { $match: { duration: { $lte: 5 } } },
    {
      $group: {
        _id: '$_id',
        num: { $sum: 1 },
        avgRatings: { $avg: '$ratingsAverage' },
        avgDurations: { $avg: '$duration' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    stats,
  });
});
const getToursWithin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? +distance / 3962.2 : +distance / 6378.1;
  if (!lat || !lng) next(new AppError('latitude and langitude are required!', 400));
  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
const getDistances = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) next(new AppError('latitude and langitude are required!', 400));
  const multiplier = unit === 'ml' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
const getTour = getOne(Tour, 'reviews');
const deleteTour = deleteOne(Tour);
const createTour = createOne(Tour);
const updateTour = updateOne(Tour);
export { getAllTours, getTour, deleteTour, createTour, updateTour, aliasTopTours, getToursStats, getMonthlyPlan, getToursWithin, getDistances, uploadTourImages, resizeTourImages };
