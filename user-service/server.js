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
const axios = require('axios');
const wrapAxios = require('zipkin-axios');
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
//call heros routing
// Using compression in the middleware will help decrease requests body response size therefore makes the app faster
app.use(compression());


//-------------------------------------------------// 
// Zipkin Tracer config 
const { Tracer, BatchRecorder, jsonEncoder: {JSON_V2} } = require("zipkin");
const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;
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
    localServiceName: "users_service" // name of this application
  });

//---------------------------------------------------------//  
// Prometheus Config 
const promBundle = require("express-prom-bundle");
const { Histogram } = require('prom-client');

const metricsMiddleware = promBundle({
  includeMethod: true, 
  includePath: true, 
  includeStatusCode: true, 
  includeUp: true,
  customLabels: {project_name: 'user_service', project_type: 'custom_metrics'},
  metricsType: Histogram,
  promClient: {
      collectDefaultMetrics: {
      }
    }
});
let register = new client.Registry();

// add the prometheus middleware to all routes
app.use(metricsMiddleware)

const op_conn_count = new client.Counter({
  name:"opened_connection_count",
  help:"Number of opened connections"
});
// Wrap an instance of axios
const zipkinAxios = wrapAxios(axios, { tracer, serviceName: 'user_services'});

// Fetch data with HTTP-GET
zipkinAxios.get('http://localhost:4002')

app.use(zipkinMiddleware({tracer}));

// Listening obviously
app.listen(4000,"0.0.0.0", function () {
  console.log("listening on 4000");
});
// Controllers routings
app.get("/", function (req, res) {
  
  op_conn_count.inc(1);
  res.sendFile(path.join(__dirname, "/", "index.html"));
});

app.post("/register", userController.registration);
app.post("/login", userController.login);
app.post("/createOrder",orderController.createOrder)
app.get("/details",userController.getDetails)

// registring the metrics to export 
register.registerMetric(op_conn_count);