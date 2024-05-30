import { User } from '../models/UserModel';
import { Scanned } from '../models/ScannedModel';
import { ErrorType } from './../middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { extractScannedData } = require('../utils/parseScannedData');

export const saveScan = async (req: Request, res: Response, next: NextFunction) => {
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

        const user = await User.findById({ _id: userId });

        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'You are not allow to access this endpoint',
            });
        }

        const { data } = req?.body;

        const parsedData = extractScannedData(data);

        const scannedData = new Scanned({
            ...parsedData,
            scannedBy: user._id,
        });

        await Scanned.create(scannedData);

        res.status(200).json({
            status: 'Success',
            data: scannedData,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong when try to save data');
        err.status = 400;
        return next(error);
    }
};

export const getAllScannedData = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
                { cccd: searchRegex },
                { cmnd: searchRegex },
                { fullname: searchRegex },
                { fullAddress: searchRegex },
                { gender: searchRegex },
            ];
        }
        const scanneds = await Scanned.find(filter)
            .populate({
                path: 'scannedBy',
                select: '_id email firstname lastname avatar position',
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        const totalScanned = await Scanned.countDocuments(filter);

        res.status(200).json({
            status: 'Success',
            results: scanneds.length,
            total: totalScanned,
            currentPage: page,
            totalPages: Math.ceil(totalScanned / limit),
            data: {
                scanneds: scanneds.map((scanned: any) => {
                    return scanned;
                }),
            },
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
};

export const deleteScannedDataById = async (req: Request, res: Response, next: NextFunction) => {
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

        const user = await User.findById({ _id: userId });

        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'You are not allow to access this endpoint',
            });
        }
        
        const {scannedId} = req?.params;

        try {
            const res = await Scanned.findByIdAndDelete(scannedId);
            console.log(res);
        } catch (error) {
            return res.status(400).json({
                status: "Error",
                message: "Something went wrong when try to delete scanned"
            })
        }

        res.status(200).json({
            status: "Success",
            message: "Delete scanned successfully"
        })
        
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}