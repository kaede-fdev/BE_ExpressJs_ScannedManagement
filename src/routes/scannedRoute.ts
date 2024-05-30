import express from 'express';

import {saveScan, getAllScannedData, deleteScannedDataById} from '../controllers/scanActionsController'

const Router = express.Router();

Router.route("/").post(saveScan);
Router.route("/all").get(getAllScannedData)
Router.route("/delete/:scannedId").delete(deleteScannedDataById);

module.exports = Router;