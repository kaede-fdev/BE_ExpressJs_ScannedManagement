import { Request, Response, NextFunction } from 'express';
import _, { forEach } from 'lodash';
import { User } from '../models/UserModel';
import { ErrorType } from '../middlewares/errorHandler';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

export const getAllUsers = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authorization = req.header('authorization');
        if (!authorization) {
            return res.status(401).json({
                error: {
                    statusCode: 400,
                    status: 'error',
                    message: 'Token is invalid',
                },
            });
        }
        const token = authorization.replace('Bearer ', '');
        const { userId } = jwt.verify(token, process.env.APP_SECRET);

        const user = await User.findById(userId);

        if (!user?.isAdmin) {
            res.status(403).json({
                status: 'error',
                message: 'You are not allowed to access this field',
            });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 999;
        const skip = (page - 1) * limit;

        let filter: any = {};

        let search = req.query.search ? req.query.search.toString() : '';
        // Remove surrounding double quotes if they exist
        search = search.replace(/^"|"$/g, '');

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { firstname: searchRegex },
                { lastname: searchRegex },
                { email: searchRegex },
                { nickname: searchRegex },
            ];
        }
        
        // Fetch users with pagination and filtering
        console.log(filter)
        const users = await User.find(filter).sort({ isAdmin: -1 }).skip(skip).limit(limit);

        const totalUsers = await User.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            results: users.length,
            total: totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            data: {
                users: users.map((user: any) => {
                    const res = _.omit(user.toObject(), ['password']);
                    return res;
                }),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        next(error);
    }
};

export const createUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authorization = req.header('authorization');
        if (!authorization) {
            return res.status(401).json({
                error: {
                    statusCode: 400,
                    status: 'error',
                    message: 'Token is invalid',
                },
            });
        }
        const token = authorization.replace('Bearer ', '');
        const { userId } = jwt.verify(token, process.env.APP_SECRET);

        const user = await User.findById(userId);

        if (!user?.isAdmin) {
            res.status(403).json({
                status: 'error',
                message: 'You are not allowed to create new user!',
            });
        }

        const { users } = req.body;
        const resUsers: any[] = [];

        forEach(users, async (user: any) => {
            const newUser = new User({
                email: user?.email,
                firstname: user?.firstname,
                lastname: user?.lastname,
                password: user?.phone,
                position: user?.position,
                isAdmin: user?.isAdmin
            });
            try {
                resUsers.push(newUser);
                await newUser.save();
            } catch (error) {
                next(error);
            }
        });

        res.status(200).json({
            status: 'success',
            data: resUsers,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong!');
        err.status = 400;
        return next(err);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = await User.findOne({
            _id: req.params?.userId,
        });
        const response = _.omit(user.toObject(), ['password']);
        res.status(200).json({
            status: 'Success',
            data: {
                ...response,
            },
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong!');
        err.status = 400;
        return next(error);
    }
};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorization = req.header('authorization');
        if (!authorization) {
            return res.status(401).json({
                error: {
                    statusCode: 400,
                    status: 'error',
                    message: 'Token is invalid',
                },
            });
        }
        const token = authorization.replace('Bearer ', '');
        const { userId } = jwt.verify(token, process.env.APP_SECRET);

        const user = await User.findById(userId);

        if (!user?.isAdmin) {
            res.status(403).json({
                status: 'error',
                message: 'You are not allowed to access this field',
            });
        }

        if(req.params?.userId === userId) {
            return res.status(400).json({
                status: 'error',
                message: 'You cant delete yourself',
            });
        }

        const {userId: id} = req.params;

        await User.findByIdAndDelete(id);

        res.status(200).json({
            status: 'Success',
            message: 'Delete user successfully',
        });

    } catch (error) {
        return next(error);
    }
};
