import express from 'express';
import * as userController from '../Controllers/userController';
import * as authController from '../Controllers/authController';

const router = express.Router();

router.post('/signup', authController.signUp);

router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); //that mean this mw will run before all next handlers

router.patch('/updatePassword', authController.updatePassword);

router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

router.get('/me', userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router.route('/:id').get(userController.getUser).delete(userController.deleteUser).patch(userController.updateUser);

export { router };
