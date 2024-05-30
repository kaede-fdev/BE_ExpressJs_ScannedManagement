import { User } from '../models/UserModel';
import { ErrorType } from './../middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

export const welcome = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            status: 'Success Access',
        });
    } catch (error) {
        next(error);
    }
};

export const registerAsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = {
            ...req.body,
            avatar: req.body?.avatar ?? "https://res.cloudinary.com/dy1uuo6ql/image/upload/v1708924368/ipghhsijubgdawyxo99v.jpg",
            isAdmin: true,
        }
        await User.create(user);
        res.status(200).json({
            status: "Success",
        })
    } catch (error) {
        next(error);
    }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = {
            ...req.body,
            avatar: req.body?.avatar ?? "https://res.cloudinary.com/dy1uuo6ql/image/upload/v1708924368/ipghhsijubgdawyxo99v.jpg",

        }
        await User.create(user);
        res.status(200).json({
            status: "Success",
        })
    } catch (error) {
        next(error);
    }
}


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            const err: ErrorType = new Error('Email or Password is not correct');
            err.status = 400;
            return next(err);
        }

        if (bcrypt.compareSync(req.body.password, user.password)) {

            const token = jwt.sign({ userId: user._id, isAdmin: user?.isAdmin }, process.env.APP_SECRET, {
                expiresIn: '7d',
            });
            const { _id, firstname, lastname, email, avatar, isAdmin } = user;
            
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        _id,
                        firstname,
                        lastname,
                        email,
                        avatar,
                        isAdmin,
                    },
                    token,
                },
            });
        } else {
            const err: ErrorType = new Error('Email or Password is not correct');
            err.status = 400;
            return next(err);
        }
    } catch (error) {
        return next(error);
    }
};
