import { NextFunction } from 'express';
import { Schema } from 'mongoose';

const mongoose = require('mongoose');

const scannedCheckinSchema = mongoose.Schema(
    {
        wholeText: {
            type: String,
            default: null
,       },
        cccd: {
            type: String,
            default: null
        },
        cmnd:{
            type: String,
            default: null,
        }, 
        fullname: {
            type: String,
            default: null,
        }, 
        gender: {
            type: String,
            default: null,
        }, 
        dob: {
            type: Date,
            default: null,
        }, 
        fullAddress: {
            type: String,
            default: null
        }, 
        issuedAt: {
            type: Date,
            default: null
        },
        scannedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true },
);


export const ScannedCheckin = mongoose.model('ScannedCheckin', scannedCheckinSchema);