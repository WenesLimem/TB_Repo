const User = require("../models/users");
const client = require("prom-client");
// adding a register
let register = new client.Registry();

//------------------------------------------------//
// metrics to export
const nb_active_users = new client.Counter({
  name: "nb_active_users",
  help: "Number of active users",
});
const nb_of_users = new client.Counter({
  name: "nb_of_users",
  help: "Number of registred users",
});



//-----------------------------------------------//

require("dotenv").config();

exports.registration = (req, res) => {
  nb_of_users.inc(1);
  const { email, password, name, job_title } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      return res.json({ msg: "user already exist" });
    } else {
      const { email, password } = req.body;
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password less than 6 characters" });
      }
      try {
        User.create({
          email,
          password,
        }).then((user) =>
          res.status(200).json({
            message: "User successfully created",
            user,
          })
        );
      } catch (err) {
        res.status(401).json({
          message: "User not successful created",
          error: error.mesage,
        });
      }
    }
  });
};

exports.login = async (req, res, next) => {
  nb_active_users.inc(1);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      res.status(401).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      res.status(200).json({
        message: "Login successful",
        user,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};


exports.getDetails = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  res.status(200).json({
    user,
  });
};

register.registerMetric(nb_active_users);
register.registerMetric(nb_of_users);
// labelizing it
register.setDefaultLabels({
  app: "users-api",
});
// tell the client what to scrape
client.collectDefaultMetrics({ register });
