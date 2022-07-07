const express = require("express");
const path = require("path");
const connect = require("./config/db");
const app = express();
const cors = require("cors");
const compression = require("compression");

const cartsController = require("./controllers/carts.controller");

//const opentelemetry = require('@opentelemetry/api');
//const tracer = require("./tracing")("carts-service");
const fileUpload = require("express-fileupload");
connect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Connect to database

app.use(fileUpload());

//---------------------------------------------------------//
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

//app.use(zipkinMiddleware({tracer}));

//app.use(zipkinMiddleware({tracer}))
const op_conn_count = new client.Counter({
  name:"opened_connection_count",
  help:"Number of opened connections"
});
/*
zipkinAxios.get('http://localhost:4000').then(function (response) {
  tracer.recordMessage(response.toString())
  console.log(response);
})
    .catch(function (error) {
      console.log(error);
    })
    */

// adding a register for prometheus
let register = new client.Registry();
app.use(compression());
// Listening obviously
app.listen(4003,'0.0.0.0', function () {
  console.log("listening on 4003");
});
// Controllers routings
app.get("/", function (req, res) {

  //const span =  tracer.startSpan("backend-page",undefined)
  op_conn_count.inc(1);
  //span.addEvent("sending index.html to render")
  res.sendFile(path.join(__dirname, "/", "index.html"));

//  span.end(Date.now());
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
app.post("/createCart/:id",cartsController.createCart)
app.use("/getCart/:id",cartsController.getCart)
app.use("/getCartContent",cartsController.getCartContent);
app.use("/addItemToCart/:cartid/:itemid",cartsController.addItemToCart)
// registring the metrics to export 
register.registerMetric(op_conn_count);