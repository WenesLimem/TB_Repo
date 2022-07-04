const express = require("express");
const path = require("path");
const connect = require("./config/db");
const app = express();
const cors = require("cors");
const compression = require("compression");
const carts = require("./routing/cart");
const auth = require("./middleware/verifyAuth");
const cartsController = require("./controllers/carts.controller");
const axios = require('axios');
const wrapAxios = require('zipkin-axios');

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
// Zipkin Tracer config

const { Tracer, BatchRecorder, jsonEncoder: {JSON_V2} } = require("zipkin");
const {HttpLogger} = require('zipkin-transport-http');
const CLSContext = require('zipkin-context-cls');
const tracer = new Tracer({
    ctxImpl: new CLSContext('zipkin', true),
    recorder: new BatchRecorder({
      logger: new HttpLogger({
        endpoint: 'http://localhost:9411/api/v2/spans',
        jsonEncoder: JSON_V2
      })
    }),
    localServiceName: "carts_service"// name of this application

  });
//--------------------------------------------------//  
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
// add the prometheus middleware to all routes
app.use(metricsMiddleware)


const op_conn_count = new client.Counter({
  name:"opened_connection_count",
  help:"Number of opened connections"
});

//app.use(zipkinMiddleware({tracer}));
// Wrap an instance of axios
const zipkinAxios = wrapAxios(axios, { tracer, serviceName: 'carts_service'});

// Fetch data with HTTP-GET
// Checking products service health
zipkinAxios.get('http://localhost:4002').then(function (response) {
    tracer.recordMessage(response.toString())
    console.log(response);
})
    .catch(function (error) {
        console.log(error);
    })

// Checking users service health
zipkinAxios.get('http://localhost:4000').then(function (response) {
    tracer.recordMessage(response.toString())
    console.log(response);
})
    .catch(function (error) {
        tracer.recordMessage(error.toString())
        console.log(error);
    })

// adding a register for prometheus
let register = new client.Registry();
app.use(compression());
// Listening obviously
app.listen(4003,'0.0.0.0', function () {
  console.log("listening on 4003");
});
// Controllers routings
app.get("/", function (req, res) {
  op_conn_count.inc(1);
  res.sendFile(path.join(__dirname, "/", "index.html"));
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