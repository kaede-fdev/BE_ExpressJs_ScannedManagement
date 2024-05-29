import express from 'express';
import {editUserInfor, changePassword} from '../controllers/settingsController';

const Router = express.Router();

Router.route("/").patch(editUserInfor);
Router.route("/change-password").patch(changePassword);

module.exports = Router;