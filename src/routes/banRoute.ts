import express from 'express';
import { createBan, deleteBanById, editBan, getAllBan } from '../controllers/banController';

const Router = express.Router();

Router.route("/").post(createBan);
Router.route("/all").get(getAllBan);
Router.route("/:banId").delete(deleteBanById);
Router.route("/edit").patch(editBan);

module.exports = Router;