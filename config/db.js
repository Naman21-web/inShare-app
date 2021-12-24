require('dotenv').config();
const mongoose = require('mongoose');

function connectDb() {
    //Database connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL)
        // , {
        //useNewUrlParser: true,
        //useCreateIndex: true,
        //useUnifiedTopology: true,
      //  useFindAndModify : true
    //});
    const connection = mongoose.connection;

    connection.once('open', () => {
        console.log('Database connected');
    })
    .on('error', function (err) {
        console.log(err);
      });
    //.catch(err => {
      //  console.log('Connection failed');
    //});
};

module.exports = connectDb;