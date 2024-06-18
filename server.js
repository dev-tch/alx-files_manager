import express from 'express';
import router from './routes/index';

const app = express();
// Middleware to parse JSON
app.use(express.json());
app.use('/', router);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
