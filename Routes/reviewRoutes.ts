import express from 'express';
import * as reviewController from '../Controllers/reviewController';
import * as authController from '../Controllers/authController';

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(authController.restrictTo('user'), reviewController.setIds, reviewController.createReview);

router.route('/:id').get(reviewController.getReview).delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview).patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);

export { router };
