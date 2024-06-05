import { Request, Response, NextFunction } from 'express';
import { ErrorType } from '../middlewares/errorHandler';
import { User } from '../models/UserModel';
import _ from 'lodash';
import { BanManager } from '../models/BanManager';


const jwt = require('jsonwebtoken');

export const createBanManager = async (req: Request, res: Response, next: NextFunction) => {
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

        const {newBanManager} = req.body;
        const newBanManagerData = new BanManager({
            ...newBanManager,
        })

        await BanManager.create(newBanManagerData);

        res.status(200).json({
            status: "Success", 
            data: newBanManagerData,
        })

    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}

export const  deleteBanManagerById = async (req: Request, res: Response, next: NextFunction) => {
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

        const {banManagerId: id} = req.params

        await BanManager.findByIdAndDelete(id);

        res.status(200).json({
            status: "Success"
        })
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}

export const editBanManager = async (req: Request, res: Response, next: NextFunction) => {
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

        const {_id} = req.body;


        const updateData = _.omit(req.body, ['_id']);
        const response = await BanManager.findByIdAndUpdate(_id, updateData, {
            new: true,
            runValidator: true,
        })

        res.status(200).json({
            status: "Success", 
            data: response
        })

    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}

export const getAllBanManager = async (req: Request, res: Response, next: NextFunction) => {
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

        const managers = await BanManager.find().populate({
            path: "banId",
        })
        res.status(200).json({
            status: "Success",
            data: {
                managers: managers.map((item: any) => {
                    return item;
                })
            }
        })

    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}

export const findBanManagerByBanId = async (req: Request, res: Response, next: NextFunction) => {
    const {banId: id} = req.params;
    console.log(id);
    try {
        const managers = await BanManager.find({
            banId: id
        }).populate({
            path: 'banId'
        })
        res.status(200).json({
            status: "Success",
            data: managers
        })
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}