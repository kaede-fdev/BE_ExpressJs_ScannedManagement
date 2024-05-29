import { NextFunction } from 'express';

const slugify = require('slugify');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            required: [true, 'Email must be required'],
            trim: true,
            default: null,
        },
        password: {
            type: String,
            required: [true, 'Password must be required'],
            minLength: [6, 'Password must be at least 6 characters'],
            trim: true,
            default: null,
        },
        avatar: {
            type: String,
            default: 'https://res.cloudinary.com/dy1uuo6ql/image/upload/v1708924368/ipghhsijubgdawyxo99v.jpg',
        },
        phone: {
            type: String,
            default: null,
        },
        firstname: {
            type: String,
            trim: true,
            default: null,
        },
        lastname: {
            type: String,
            trim: true,
            default: null,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        position: {
            type: String,
            trim: true,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true },
);

userSchema.pre('save', function (this: any, next: NextFunction) {
    const user = this;

    // Hash password if it's new or has been modified
    if (user.isModified('password')) {
        bcrypt.hash(user.password, 10, function (err: Error, hash: string) {
            if (err) {
                return next(err);
            } else {
                user.password = hash;
                next();
            }
        });
    } else {
        next();
    }
});

export const User = mongoose.model('User', userSchema);
