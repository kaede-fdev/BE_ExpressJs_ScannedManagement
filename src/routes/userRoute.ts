import express from 'express';

import {getAllUsers, createUser, getUserById, deleteUserById} from '../controllers/userController';

const Router = express.Router();

Router.route("/all").get(getAllUsers);
Router.route("/create").post(createUser);
Router.route("/:userId").get(getUserById);
Router.route("/:userId").delete(deleteUserById);

module.exports = Router;