import express from 'express';
import './db/mongoose.js';
import { goodRouter } from './routers/good.js';
import { hunterRouter } from './routers/hunters.js';
import { merchantRouter } from './routers/merchants.js';
import { transactionRouter } from './routers/transactions.js';
import { defaultRouter } from './routers/default.js';

const app = express();
app.disable('x-powered-by');

app.use(express.json());
app.use(goodRouter);
app.use(hunterRouter);
app.use(merchantRouter);
app.use(transactionRouter);

app.use(defaultRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
