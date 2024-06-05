import { Request, Response, NextFunction } from 'express';
import { ErrorType } from '../middlewares/errorHandler';
import { User } from '../models/UserModel';
import { Ban } from '../models/Ban';
import _ from 'lodash';

const jwt = require('jsonwebtoken');

export const createBan = async (req: Request, res: Response, next: NextFunction) => {
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

        const {banname} = req.body;

        if(!banname) {
            res.status(400).json({
                status: "Error",
                message: "Null cant not be saved"
            })
        }

        const response = await Ban.create({
            ban: banname
        })

        res.status(200).json({
            status: "Success",
            data: _.omit(response.toObject())
        })
        
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}

export const deleteBanById = async (req: Request, res: Response, next: NextFunction) => {
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
        const {banId :id} = req.params;

        console.log(id);

        await Ban.findByIdAndDelete(id);
        res.status(200).json({
            status: "Success",
            message: "Delete ban success"
        })

    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}   

export const editBan = async (req: Request, res: Response, next: NextFunction) => {
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

        const response = await Ban.findByIdAndUpdate(_id, updateData, {
            new: true,
            returnValidator: true
        });

        res.status(200).json({
            status: "Success",
            data: response,
        })

    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}

export const getAllBan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const all = await Ban.find();
        res.status(200).json({
            status: "Success",
            data: all
        })
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
} 