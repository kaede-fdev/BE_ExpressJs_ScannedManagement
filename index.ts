require('dotenv').config();
import { ErrorType } from './src/middlewares/errorHandler';

import express from 'express';
import cors from 'cors';

const { errorHandler } = require('./src/middlewares/errorHandler');
const { connectDB} = require('./src/configurations/dbContext')

connectDB();
//routes
const authRoute = require('./src/routes/authRoute');
const userRoute = require('./src/routes/userRoute');
const settingsRoute = require('./src/routes/settingsRoute');

const app = express();
const server = require("http").Server(app);

const port = process.env.APP_PORT || 8089;

app.use(cors());
app.use(express.json());

//implement app route
app.use('/', authRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/settings', settingsRoute);

app.all('*', (req, res, next) => {
    const err: ErrorType = new Error('Unhandled Route');
    err.statusCode = 404;
    next(err);
});

app.use("/api/v1", errorHandler);

server.listen(port, () => {
    console.log(`Server connect to port successfully http://localhost:${port} `);
})


