import express from 'express';

import {
    saveScan,
    getAllScannedData,
    deleteScannedDataById,
    saveScanForCheckout,
    getAllScannedDataForCheckout,
    longeastScanCheckin,
    longeastScanCheckout,
    getAllScannedDataByDate,
    getAllScannedDataByDateForCheckoutData,
    saveScanFromHandInput,
    saveScanFromHandInputForCheckout,
    deleteScannedDataByIdForCheckout,
    editScanCheckin,
    editScanCheckout,
} from '../controllers/scanActionsController';

const Router = express.Router();

Router.route('/checkin').post(saveScan);
Router.route('/checkout').post(saveScanForCheckout);
Router.route('/all/checkin').get(getAllScannedData);
Router.route('/all/checkout').get(getAllScannedDataForCheckout);
Router.route('/delete/:scannedId').delete(deleteScannedDataById);
Router.route('/checkin-long').get(longeastScanCheckin);
Router.route('/checkout-long').get(longeastScanCheckout);
Router.route('/download/checkin').get(getAllScannedDataByDate);
Router.route('/download/checkout').get(getAllScannedDataByDateForCheckoutData);

Router.route('/checkin/hand').post(saveScanFromHandInput
);
Router.route('/checkout/hand').post(saveScanFromHandInputForCheckout
);

Router.route('/delete-checkout/:scannedId').delete(deleteScannedDataByIdForCheckout)

Router.route('/checkin/edit').patch(editScanCheckin);
Router.route('/checkout/edit').patch(editScanCheckout);

module.exports = Router;
