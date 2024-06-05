import { NextFunction } from 'express';
import { Schema } from 'mongoose';

const mongoose = require('mongoose');


const banManagerSchema = mongoose.Schema(
    {
      fullname: {
        type: String,
        default: null,
      },
      banId: {
          type: Schema.Types.ObjectId,
          ref: "Ban"
      }, 
    },
    { timestamps: true },
);

export const BanManager = mongoose.model("Manager", banManagerSchema);