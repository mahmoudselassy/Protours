import { NextFunction, Request, Response } from 'express';
import { AppError } from '../Utils/appError';
import { User } from '../Models/userModel';
import catchAsync from '../Utils/catchAsync';
import { deleteOne, updateOne, getOne, getAll } from './operationController';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
/*
const storage = multer.diskStorage({
  destination(req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) {
    callback(null, 'public/img/users');
  },
  filename(req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
    const ext = file.mimetype.split(`/`)[1];
    callback(null, `user-${(req as any).user.id}-${Date.now()}.${ext}`);
  },
});*/
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

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  req.file.filename = `user-${(req as any).user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
  next();
});

const getAllUsers = getAll(User);

const getUser = getOne(User);

const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = (req as any).user.id;
  next();
};

const deleteUser = deleteOne(User);

const updateUser = updateOne(User);

const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('this route is not responsable for updating password!', 404));
  }
  let name = (req as any).body.name ?? (req as any).user.name;
  let email = (req as any).body.email ?? (req as any).user.email;
  let photo = req.file?.filename;

  const updatedUser = await User.findByIdAndUpdate(
    (req as any).user.id,
    { name, email, photo },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: { updatedUser },
  });
});

const deleteMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await User.findByIdAndUpdate((req as any).user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
export { getAllUsers, getUser, deleteUser, updateUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto };
