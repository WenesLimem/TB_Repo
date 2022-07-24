const cl = require("../server")

const op_conn_count = new cl.client.Counter({
    name:"opened_connection_count",
    help:"Number of opened connections"
  });
  // number of carts created 
  const nb_created_carts = new cl.client.Counter({
    name:"created_carts_number",
    help:"Number of created carts"
  })
  
  const nb_validated_carts = new cl.client.Counter({
    name:"validated_carts_number",
    help:"Number of validated carts"
  })
  const avg_order_value = new cl.client.Counter({
    name:"avg_orders_value",
    help:"Average value of client orders"
  })

  // registring the metrics to export 
cl.register.registerMetric(op_conn_count);
cl.register.registerMetric(nb_created_carts);
cl.register.registerMetric(nb_validated_carts);
cl.register.registerMetric(avg_order_value);
// labelizing the metrics 
cl.register.setDefaultLabels({
  app:'carts-api'
});
// tell the client what to scrape
cl.cclient.collectDefaultMetrics({register});


module.exports.avg_order_value;
module.exports.nb_validated_carts;
module.exports.nb_created_carts;