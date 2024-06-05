const mongoose = require('mongoose');


const banSchema = mongoose.Schema(
    {
      ban: {
        type: String,
        default: null,
      }
    },
    { timestamps: true },
);

export const Ban = mongoose.model("Ban", banSchema);