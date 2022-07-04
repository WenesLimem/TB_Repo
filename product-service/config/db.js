const mongoose = require("mongoose");
require('dotenv').config()

const connect = async () => {
    try {
        await mongoose.connect(process.env.MOGOURI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex:true
        });
        console.log("db connected",process.env.MOGOURI);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

};
module.exports = connect;
