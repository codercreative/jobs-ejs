const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindandModify: false,
    useUnifiedTopology: true,
  });
};

module.exports = connectDB;
