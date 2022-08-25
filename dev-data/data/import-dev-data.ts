import * as fs from 'fs';
import { Tour } from '../../Models/tourModel';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from '../../app';
dotenv.config({ path: '../../config.env' });
mongoose.connect(process.env.DATABASE_LOCAL!, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

app.listen(process.env.PORT);
const tours = JSON.parse(fs.readFileSync('./tours-simple.json').toString());
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
