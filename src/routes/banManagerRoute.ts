import express from 'express';
import { createBanManager, deleteBanManagerById, editBanManager, findBanManagerByBanId, getAllBanManager } from '../controllers/banManagerController';

const Router = express.Router();

Router.route('/').post(createBanManager);
Router.route('/:banManagerId').delete(deleteBanManagerById);
Router.route('/edit').patch(editBanManager);
Router.route('/all').get(getAllBanManager);
Router.route('/withBan/:banId').get(findBanManagerByBanId)

module.exports = Router;