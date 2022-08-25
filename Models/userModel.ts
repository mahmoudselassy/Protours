import { NextFunction } from 'express';
import mongoose from 'mongoose';
import validator from 'validator';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

interface user {
  name?: mongoose.Schema.Types.String | null;
  email?: mongoose.Schema.Types.String | null;
  photo?: mongoose.Schema.Types.String | null;
  role?: mongoose.Schema.Types.String | null;
  password?: mongoose.Schema.Types.String | null;
  confirmPassword?: mongoose.Schema.Types.String | null;
  passwordChangedAt?: mongoose.Schema.Types.Date | null;
  active?: mongoose.Schema.Types.Boolean | null;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name !'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Email address is required !'],
    validate: [validator.isEmail, 'Please provide a valid email !'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required !'],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password !'],
    validate: {
      //this validator will not work on update it works only on save and create
      validator: function (el: mongoose.Schema.Types.String): boolean {
        return el === (this as user).password;
      },
      message: 'Passwords are not the same !',
    },
  },
  passwordResetToken: String,
  paswwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (this: any, next: Function) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', async function (this: any, next: Function) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, async function (this: any, next: Function) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.isCorrectPassword = async function (candidatePassword: string, userPassword: string) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (this: any, JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000) as any, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function (this: any) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.paswwordResetExpires = Date.now() + 10 * 60 * 1000;
  if (!this.passwordResetExpires) console.log('hello');
  return resetToken;
};

const User = mongoose.model('User', userSchema);

export { User };
