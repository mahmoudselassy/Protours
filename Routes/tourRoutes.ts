import express from 'express';
import * as tourController from '../Controllers/tourController';
import * as authController from '../Controllers/authController';
import { router as reviewRouter } from '../Routes/reviewRoutes';

const router = express.Router();

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getToursStats);

router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/').get(tourController.getAllTours).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router.route('/:id').get(tourController.getTour).delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour);

router.use('/:tourId/reviews', reviewRouter);
export { router };
