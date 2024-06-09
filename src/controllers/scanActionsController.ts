import { User } from '../models/UserModel';
import { ScannedCheckin } from '../models/ScannedChecking';
import { ErrorType } from './../middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { ScannedCheckout } from '../models/ScannedCheckout';
import { subMinutes } from 'date-fns';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { extractScannedData } = require('../utils/parseScannedData');

//Sorry 'cause this src so trash =((
//Please read some cmt to ensure understand the change in function =(
//Hope good

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

        const now = new Date();
        const tenMinutesAgo = subMinutes(now, 5);

        const { data } = req?.body;
        const {banId, managerName} = req?.body;

        const foundExisted = await ScannedCheckin.findOne({
            wholeText: data,
            createdAt: { $gte: tenMinutesAgo, $lte: now },
        });

        if (data === foundExisted?.wholeText) {
            const foundCheckoutExisted = await ScannedCheckout.findOne({
                wholeText: foundExisted?.wholeText,
                createdAt: { $gte: tenMinutesAgo, $lte: now },
            });

            if (foundCheckoutExisted) {
                res.status(200).json({
                    status: 'Found',
                    message: 'Check out already existed',
                });
                return;
            }

            const parseDataForCheckout = extractScannedData(data);
            const scannedDataForCheckout = new ScannedCheckout({
                ...parseDataForCheckout,
                scannedBy: user._id,
                banId: foundExisted?.banId,
                // managerId: foundExisted?.managerId
                managerName: foundExisted?.managerName
            });
            
            // await ScannedCheckout.create(scannedDataForCheckout);
            // res.status(200).json({
            //     status: 'Success',
            //     message: 'Checkout saved',
            //     data: parseDataForCheckout,
            // });
            return;
        }

        const parsedData = extractScannedData(data);

        const scannedData = new ScannedCheckin({
            ...parsedData,
            scannedBy: user._id,
            banId: banId,
            managerName: managerName
        });

        await ScannedCheckin.create(scannedData);

        res.status(200).json({
            message: 'Checkin saved',
            status: 'Success',
            data: scannedData,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong when try to save data');
        err.status = 400;
        return next(error);
    }
};

export const saveScanForCheckout = async (req: Request, res: Response, next: NextFunction) => {
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

        const { data } = req.body;

        const now = new Date();
        const tenMinutesAgo = subMinutes(now, 10);

        const foundExisted = await ScannedCheckout.findOne({
            wholeText: data,
            createdAt: { $gte: tenMinutesAgo, $lte: now },
        });

        if (foundExisted?.wholeText === data) {
            res.status(200).json({
                status: 'Founed',
                message: 'Already existed',
            });
            return;
        }

        const parsedData = extractScannedData(data);

        const scannedData = new ScannedCheckin({
            ...parsedData,
            scannedBy: user._id,
        });

        await ScannedCheckout.create(scannedData);
        res.status(200).json({
            message: 'Checkout saved',
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

        if (req.query.isCheckout) {
            filter.isCheckout = req.query.isCheckout === 'true';
        }

        const scanneds = await ScannedCheckin.find(filter)
            .populate({
                path: 'scannedBy',
                select: '_id email firstname lastname avatar position',
            })
            .populate('banId')
            .populate('managerId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        const totalScanned = await ScannedCheckin.countDocuments(filter);

        res.status(200).json({
            status: 'Success',
            message: 'Checkin data',
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

export const getAllScannedDataForCheckout = async (req: Request, res: Response, next: NextFunction) => {
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
    const scanneds = await ScannedCheckout.find(filter)
        .populate({
            path: 'scannedBy',
            select: '_id email firstname lastname avatar position',
        })
        .populate('banId')
        .populate('managerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

    const totalScanned = await ScannedCheckin.countDocuments(filter);

    res.status(200).json({
        status: 'Success',
        message: 'Checkout data',
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

        const { scannedId } = req?.params;

        try {
            const res = await ScannedCheckin.findByIdAndDelete(scannedId);
        } catch (error) {
            return res.status(400).json({
                status: 'Error',
                message: 'Something went wrong when try to delete scanned',
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Delete scanned successfully',
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
};

export const deleteScannedDataByIdForCheckout = async (req: Request, res: Response, next: NextFunction) => {
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

        const { scannedId } = req?.params;

        try {
            const res = await ScannedCheckout.findByIdAndDelete(scannedId);
        } catch (error) {
            return res.status(400).json({
                status: 'Error',
                message: 'Something went wrong when try to delete scanned',
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Delete scanned successfully',
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
};

export const longeastScanCheckin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const foundTime = await ScannedCheckin.findOne({}).sort('createdAt').select('createdAt');
        res.status(200).json({
            status: 'Success',
            data: foundTime,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
};
export const longeastScanCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const foundTime = await ScannedCheckout.findOne({}).sort('createdAt').select('createdAt');
        res.status(200).json({
            status: 'Success',
            data: foundTime,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
};

export const getAllScannedDataByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let filter: any = {};

        const fromDate = req.query.fromDate ? new Date(req.query.fromDate.toString()) : null;
        const toDate = req.query.toDate ? new Date(req.query.toDate.toString()) : new Date();

        if (fromDate && toDate) {
            filter.createdAt = { $gte: fromDate, $lte: toDate };
        }

        filter.isCheckout = false;

        const scanneds = await ScannedCheckin.find(filter)
            .populate({
                path: 'scannedBy',
                select: '_id email firstname lastname avatar position',
            })
            .populate('banId')
            .populate('managerId')
            .sort({ createdAt: -1 })
            .exec();

        const totalScanned = await ScannedCheckin.countDocuments(filter);

        res.status(200).json({
            status: 'Success',
            message: 'Checkin data',
            results: scanneds.length,
            total: totalScanned,
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

export const getAllScannedDataByDateForCheckoutData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let filter: any = {};

        const fromDate = req.query.fromDate ? new Date(req.query.fromDate.toString()) : null;
        const toDate = req.query.toDate ? new Date(req.query.toDate.toString()) : new Date();

        if (fromDate && toDate) {
            filter.createdAt = { $gte: fromDate, $lte: toDate };
        }
        filter.isCheckout = true;

        const scanneds = await ScannedCheckin.find(filter)
            .populate({
                path: 'scannedBy',
                select: '_id email firstname lastname avatar position',
            })
            .populate('banId')
            .populate('managerId')
            .sort({ createdAt: -1 })
            .exec();

        const totalScanned = await ScannedCheckout.countDocuments(filter);

        res.status(200).json({
            status: 'Success',
            message: 'Checkout data',
            results: scanneds.length,
            total: totalScanned,
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

export const saveScanFromHandInput = async (req: Request, res: Response, next: NextFunction) => {
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

        const saveData = req.body;
        console.log(saveData);

        const response = await ScannedCheckin.create({
            ...saveData,
            scannedBy: user._id,
        });

        res.status(200).json({
            status: 'Success',
            data: response,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
};

export const saveScanFromHandInputForCheckout = async (req: Request, res: Response, next: NextFunction) => {
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

        const saveData = req.body;

        const response = await ScannedCheckout.create({
            ...saveData,
            scannedBy: user._id,
        });

        res.status(200).json({
            status: 'Success',
            data: response,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
};

export const editScanCheckin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body;
        const updateData = _.omit(req.body, ['_id']);
        console.log(updateData);
        const dbResult = await ScannedCheckin.findByIdAndUpdate(_id, updateData, {
            new: true,
            runValidator: true,
        });
        const response = _.omit(dbResult.toObject());

        res.status(200).json({
            status: 'Success',
            message: 'Edit successfully',
            data: response,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}

export const editScanCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body;
        const updateData = _.omit(req.body, ['_id']);
        const dbResult = await ScannedCheckout.findByIdAndUpdate(_id, updateData, {
            new: true,
            runValidator: true,
        });
        const response = _.omit(dbResult.toObject());

        res.status(200).json({
            status: 'Success',
            message: 'Edit successfully',
            data: response,
        });
    } catch (error) {
        const err: ErrorType = new Error('Something went wrong');
        err.status = 400;
        return next(error);
    }
}