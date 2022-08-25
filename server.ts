import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';
dotenv.config({ path: './config.env' });
mongoose
  .connect(process.env.DATABASE_LOCAL!, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successful Conncection to Mongo');
  });
const server = app.listen(process.env.PORT);
process.on('unhandledRejection', (err: Error) => {
  console.log('unhandledRejection');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
process.on('uncaughtException', (err: Error) => {
  console.log('uncaughtException');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
