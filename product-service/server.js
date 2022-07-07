const express = require("express");
const path = require("path");
const connect = require("./config/db");
const app = express();
const cors = require("cors");
const compression = require("compression");

const opentelemetry = require('@opentelemetry/api');
const tracer = require("./tracing")("products-service");

const fileUpload = require("express-fileupload");
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
//-------------------------------------------------//
// Prometheus Config 
const promBundle = require("express-prom-bundle");
const {Histogram} = require('prom-client');
const client = require('prom-client');
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: {project_name: 'products_service', project_type: 'custom_metrics'},
    metricsType: Histogram,
    promClient: {
        collectDefaultMetrics: {}
    }
});
//-------------------------------------------------//
// add the prometheus middleware to all routes
app.use(metricsMiddleware)
// adding a register 
let register = new client.Registry();
// definitions metrics to export
const op_conn_count = new client.Counter({
    name: "opened_connection_count",
    help: "Number of opened connections"
});
const nb_sold_products = new client.Counter({
    name: "nb_sold_products",
    help: "Number of sold products"
});
// registering the metrics to export
register.registerMetric(op_conn_count);
register.registerMetric(nb_sold_products);
// labelling it
register.setDefaultLabels({
    app: 'products-api'
});
// tell the client what to scrape
client.collectDefaultMetrics({register});


app.use(compression());
// Listening obviously
app.listen(4002, function () {
    console.log("listening on 4002");
});
// Controllers routings
app.get("/", function (req, res) {
    const ctx = opentelemetry.context.active();
    const span = tracer.startSpan("backend-page", undefined, ctx)
    op_conn_count.inc(1);
    res.sendFile(path.join(__dirname, "/", "index.html"));
    span.end(Date.now())
});
// metrics endpoint 
app.get("/metrics", async (req, res) => {
    res.setHeader('Content-type', register.contentType);
    res.end(await register.metrics());
});



