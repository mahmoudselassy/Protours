import { User } from '../Models/userModel';
import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../Utils/catchAsync';
import { AppError } from '../Utils/appError';
import { sendEmail } from '../Utils/email';
import * as jwt from 'jsonwebtoken';

interface Payload {
  id: string;
  iat: any;
}

const signToken = (id: string) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES!) * 24 * 60 * 60 * 1000),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('please enter email and password correctly!', 400));
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.isCorrectPassword(password, user.password);
  if (!correct || !user) return next(new AppError('Incorrect email or password!', 401));
  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token!) {
    return next(new AppError('you are not logged in,please, login to get access!', 401));
  }
  const decoded = (await jwt.verify(token, process.env.JWT_SECRET!)) as Payload;

  const userStillExist = await User.findById(decoded.id);
  if (!userStillExist) {
    return next(new AppError('User belong to this token is no longer exists!', 401));
  }
  if (userStillExist.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('user changed password,please login again!', 401));
  }
  (req as any).user = userStillExist;
  next();
});

const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return next(new AppError('you do not have permissions to perform this action!', 403));
    }
    next();
  };
};

const forgetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email!', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm:${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token valid for 10 minutes',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token has been sent to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('there was error while sending email,try again later', 500));
  }
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, paswwordResetExpires: { $gt: new Date(Date.now()) } });
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById((req as any).user.id).select('+password');
  const correct = await user.isCorrectPassword(req.body.oldPassword, user.password);
  if (!correct) return next(new AppError('Incorrect password!', 401));
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();
  createSendToken(user, 200, res);
});

export { signUp, login, protect, restrictTo, forgetPassword, resetPassword, updatePassword };
