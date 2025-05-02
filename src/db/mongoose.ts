import { connect } from 'mongoose';

/*
import dotenv from 'dotenv';

dotenv.config();
const mongoURI = process.env.MONGODB_URI;

if(!mongoURI) {
  console.error("ERROR: variable de entorno no definida.");
  process.exit(1);
}

connect(mongoURI).then(() => {
  console.log("CONECTADO a mongoDB Atlas...");
}).catch((error) => {
  console.log("ERROR al conectar a mongoDB Atlas...", error);
})
*/


connect('mongodb://127.0.0.1:27017/witcher-api').then(() => {
  console.log('Connection to MongoDB server established');
}).catch(() => {
  console.log('Unable to connect to MongoDB server');
});