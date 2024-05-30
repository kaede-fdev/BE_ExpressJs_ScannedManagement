import express from 'express';

import {saveScan, getAllScannedData} from '../controllers/scanActionsController'

const Router = express.Router();

Router.route("/").post(saveScan);
Router.route("/all").get(getAllScannedData)

module.exports = Router;