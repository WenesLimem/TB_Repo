const User = require("../models/users");
const bcrypt = require("bcrypt");
const tracer = require('../tracing')('users-service');
const client = require("prom-client")
const api = require('@opentelemetry/api');

// adding a register
let register = new client.Registry();
const jwt = require('jsonwebtoken');
const {
    scryptSync,
    createDecipheriv
} = require('node:crypto');
const http = require("http");
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
//instrumented
exports.registration = (req, res) => {
    nb_of_users.inc(1);
    const {email, password} = req.body;
    const span = tracer.startSpan("registerUser-handler", undefined)
    User.findOne({email}).then((user) => {
        if (user) {
            span.addEvent("found user with that name");
            return res.json({msg: "user already exist"});
        } else {
            if (password.length < 6) {
                span.addEvent("something wrong with the password");
                return res
                    .status(400)
                    .json({message: "Password less than 6 characters"});
            }
            span.addEvent("getting user info ")
            const ctx2 = api.context.active();
            const chSpan = tracer.startSpan("registring user to db", undefined, ctx2)
            const createUser = new User({email, password});
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(createUser.password, salt, (err, hash) => {
                    createUser.password = hash;
                    createUser.save().then((user) => {
                            res.send(user)
                        }
                    )
                })
            })
            span.end(Date.now());
        }
    })
}
// non instrumented
exports.login = async (req, res, next) => {
    nb_active_users.inc(1);
    const span = tracer.startSpan("login-handler")
    const {email, password} = req.body;

    span.addEvent("finding user from db")
    const user = await User.findOne({email});
    User.findOne({email, password});
    !user
        ? res.status(404).json({msg: "Email does not exist, please verify!"})
        : bcrypt.compare(password, user.password).then((isMatched) => {
            if (isMatched) {
                const payload = {id: user.id, email: user.email};
                jwt.sign(
                    payload,
                    process.env.secretkey,
                    {expiresIn: 999999},
                    (err, token) => {
                        if (err) throw err;
                        res.status(200).json({token: token, id: user._id});
                    }
                );
            } else {
                return res.status(401).json({msg: "password incorrect"});
            }
        });
    // verifyMiddleware
    span.addEvent("signing jwt token")
    span.end(Date.now())
};
exports.getDetails = async (req, res, next) => {
    const email = req.body.email;
    const user = await User.findOne({email});
    res.status(200).json({
        user,
    });
};

exports.getItemDetails = async (req, res, next) => {
    const id = req.params.id;
    console.log(id);
    const span = tracer.startSpan('fetch-item-info');
    const path = "/getItem/" + id.toString();
    api.context.with(api.trace.setSpan(api.context.active(), span), () => {
        http.get({
            host: 'localhost',
            port: 4002,
            path: path,
        }, (res) => {
            const body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                span.addEvent("Fetched item info ")
                span.end();
            });
        });
        res.send();
    });
    res.status(200);
};


register.registerMetric(nb_active_users);
register.registerMetric(nb_of_users);
// labelizing it
register.setDefaultLabels({
    app: "users-api",
});
// tell the client what to scrape
client.collectDefaultMetrics({register});
