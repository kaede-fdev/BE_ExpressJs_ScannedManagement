import express from 'express';

import { welcome, registerAsAdmin, register, login } from '../controllers/authController';
import { verifyToken } from '../controllers/verifyAccessToken';

const Router = express.Router();

Router.route('/').get(welcome);
Router.route('/registerAsAdmin').post(registerAsAdmin);
Router.route('/register').post(register);
Router.route('/login').post(login);
Router.route('/verify').get(verifyToken);

module.exports = Router;