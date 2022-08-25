import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
const xss = require('xss-clean');
import { rateLimit } from 'express-rate-limit';
import { router as tourRouter } from './Routes/tourRoutes';
import { router as userRouter } from './Routes/userRoutes';
import { router as reviewRouter } from './Routes/reviewRoutes';
import { router as bookingRouter } from './Routes/bookingRoutes';
import { AppError } from './Utils/appError';
import globalErrorHandler from './Controllers/errorController';
import * as path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests in one hour!',
});

app.use(mongoSanitize());

app.use(xss());

app.use(helmet());

app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
  })
);

app.use('/api', limiter);

app.use(express.json());

app.use(morgan('dev'));

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  /*res.status(404).json({
    status: 'fail',
    message: `Cant find ${req.originalUrl} on this server!`,
  });*/
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export { app };
