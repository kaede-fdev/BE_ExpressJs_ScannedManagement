import { NextFunction } from 'express';
import { Schema } from 'mongoose';

const slugify = require('slugify');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const scannedSchema = mongoose.Schema(
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


export const User = mongoose.model('Scanned', scannedSchema);