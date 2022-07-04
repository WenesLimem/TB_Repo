const express = require("express");
const path = require("path");
const connect = require("./config/db");
const app = express();
const cors = require("cors");
const compression = require("compression");
const posts = require("./routing/product");
const auth = require("./middleware/verifyAuth");

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
    localServiceName: "products service" // name of this application
  });
//---------------------------------------------------------//  
// Prometheus Config 
const promBundle = require("express-prom-bundle");
const { Histogram } = require('prom-client');
const client = require('prom-client');
const metricsMiddleware = promBundle({
  includeMethod: true, 
  includePath: true, 
  includeStatusCode: true, 
  includeUp: true,
  customLabels: {project_name: 'product_service', project_type: 'custom_metrics'},
  metricsType: Histogram,
  promClient: {
      collectDefaultMetrics: {
      }
    }
});
// add the prometheus middleware to all routes
app.use(metricsMiddleware)
// adding a register 
let register = new client.Registry();
// metrics to export 
const op_conn_count = new client.Counter({
  name:"opened_connection_count",
  help:"Number of opened connections"
});
const nb_sold_products = new client.Counter({
  name:"nb_sold_products",
  help:"Number of sold products"
});
// registering the metrics to export
register.registerMetric(op_conn_count);
register.registerMetric(nb_sold_products);
// labelling it
register.setDefaultLabels({
  app:'products-api'
});
// tell the client what to scrape
client.collectDefaultMetrics({register});

app.use(zipkinMiddleware({tracer}));

app.use(compression());
// Listening obviously
app.listen(4002, function () {
  console.log("listening on 4002");
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

app.use("/posts", posts);

