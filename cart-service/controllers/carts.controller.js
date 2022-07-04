const Cart = require("../models/Cart");
// Primary CRUD for posts
const client = require('prom-client');
const http = require("http");
// adding a register 
let register = new client.Registry();


const nb_validated_carts = new client.Counter({
  name:"validated_carts_number",
  help:"Number of validated carts"
})

const nb_created_carts = new client.Counter({
  name:"number_of_created_carts",
  help:"Number of created carts"
})



exports.getCart = async (req, res) => {
  await Cart.findOne({ _id: req.params.id }, "_id")
    .then((posts) => res.status(200).json(posts))
    .catch((err) => res.status(404).json({ message: err.message }));
};
exports.getCartContent = async (req, res) => {
  // this method will be called by user service whenever the user decides to buys the cart.
  nb_validated_carts.inc(1);
  // need cart content without user_id
  // basically we can retrieve them from previous request , but idk .
};
exports.createCart = async (req, res) => {
  nb_created_carts.inc(1);
  // Estimate Adult Reading Time
  const userId = req.body.userId;
  const items_id = req.body.items_ids;
  const items_quantity = req.body.quantities;
  const items_price = req.body.prices;


  // computing total
  // need to convert prices to numeric
  let total = 0
  let x;
  for (let i = 0; i < items_price.length; i++) {
    // converting number to int then adding to table
    x = parseInt(items_price[i]);
    // adding number value to total
    total += x;
  }

  const cart = {
    userId: userId,
    items_id: items_id,
    items_quantity: items_quantity,
    items_price: items_price,
    total:total
  };
  Cart.create(cart).then((carts) => {
        res.status(200).send({ carts });})
      .catch((err) => res.status(404).json({ message: err.message }));
};
exports.updateCart = async (req, res) => {
  Cart.updateOne({ _id: req.params.id }).exec(function (err, result) {
    res.status(200).send({ success: true });
    if (err) {
      return err;
    }
  });
};
exports.deleteCart = async (req, res) => {
  Cart.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).send({ success: true }))
    .catch((err) => res.status(404).json({ message: err.message }));
};

// Metrics registration

register.registerMetric(nb_validated_carts);
register.registerMetric(nb_created_carts)

// Metrics labels
register.setDefaultLabels({
  app:'carts-api'
  });
// tell the client what to scrape
client.collectDefaultMetrics({register});
  