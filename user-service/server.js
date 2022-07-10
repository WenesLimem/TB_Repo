const express = require("express");
const path = require("path");
const connect = require("./config/db");
const app = express();
const cors = require("cors");
const userController = require("./controllers/user.controller");
const orderController = require("./controllers/order.controller");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const client = require('prom-client');

connect();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
// Connect to database
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});
app.use(fileUpload());
//call heros routing
// Using compression in the middleware will help decrease requests body response size therefore makes the app faster
app.use(compression());


//---------------------------------------------------------//
// Prometheus Config
const promBundle = require("express-prom-bundle");
const {Histogram} = require('prom-client');

const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: {project_name: 'users_service', project_type: 'custom_metrics'},
    metricsType: Histogram,
    promClient: {
        collectDefaultMetrics: {}
    }
});
let register = new client.Registry();

// add the prometheus middleware to all routes
app.use(metricsMiddleware)

const op_conn_count = new client.Counter({
    name: "opened_connection_count",
    help: "Number of opened connections"
});



// Listening obviously
app.listen(4000, "0.0.0.0", function () {
    console.log("listening on 4000");
});
// Controllers routings
app.get("/", function (req, res) {

    op_conn_count.inc(1);
    res.sendFile(path.join(__dirname, "/", "index.html"));
});

app.post("/register", userController.registration);
app.post("/login", userController.login);
app.post("/createOrder/:cartid/:uid", orderController.createOrder)
app.get("/details", userController.getDetails)
app.get("/getitemdetails/:id",userController.getItemDetails);
// registring the metrics to export
register.registerMetric(op_conn_count);