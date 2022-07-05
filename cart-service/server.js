const express = require("express");
const path = require("path");
const connect = require("./config/db");
const app = express();
const cors = require("cors");
const compression = require("compression");
const carts = require("./routing/cart");
const auth = require("./middleware/verifyAuth");
const cartsController = require("./controllers/carts.controller");
const opentelemetry = require('@opentelemetry/api');
const tracer = require("./tracing")("carts-service");

const fileUpload = require("express-fileupload");
connect();

app.use(express.urlencoded({ extended: true }));
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
const { Histogram } = require('prom-client');
const client = require('prom-client');

const metricsMiddleware = promBundle({
  includeMethod: true, 
  includePath: true, 
  includeStatusCode: true, 
  includeUp: true,
  customLabels: {project_name: 'carts_service', project_type: 'custom_metrics'},
  metricsType: Histogram,
  promClient: {
      collectDefaultMetrics: {
      }
    }
});
//-------------------------------------------------//
// add the prometheus middleware to all routes
app.use(metricsMiddleware)

//app.use(zipkinMiddleware({tracer}))
const op_conn_count = new client.Counter({
  name:"opened_connection_count",
  help:"Number of opened connections"
});


// adding a register for prometheus
let register = new client.Registry();
app.use(compression());
// Listening obviously
app.listen(4003,'0.0.0.0', function () {
  console.log("listening on 4003");
});
// Controllers routings
app.get("/", function (req, res) {
  const ctx = opentelemetry.context.active();
  const span =  tracer.startSpan("backend-page",undefined,ctx)
  op_conn_count.inc(1);
  span.addEvent("sending index.html to render")
  res.sendFile(path.join(__dirname, "/", "index.html"));

  span.end(Date.now());
});

// metrics endpoint 
app.get("/metrics",async (req,res)=>{
  res.setHeader('Content-type',register.contentType);
  res.end(await register.metrics());
});
// health endpoint for k8s
app.get("/health",async(req,res_)=>{
})
//app.get("/getCart",tracer,cartsController.getCart);
app.post("/createCart",cartsController.createCart)
app.get("/getCart/",cartsController.getCart)
// registring the metrics to export 
register.registerMetric(op_conn_count);