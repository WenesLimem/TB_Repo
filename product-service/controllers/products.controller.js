const Product = require("../models/product");
// Primary CRUD for posts

exports.getItem = async (req, res) => {
  await Product.findOne({ _id: req.params.id }, "-_id")
    .then((posts) => res.status(200).json(posts))
    .catch((err) => res.status(404).json({ message: err.message }));
};
exports.getItems = async (req, res) => {
  await Product.find("-_id")
      .then((posts) => res.status(200).json(posts))
      .catch((err) => res.status(404).json({ message: err.message }));
};
exports.createItem = async (req, res) => {
  const item = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
  };
  // Check for duplicate items //
  const itemsHistory = await Product.findOne({ name: item.name }).exec();
  if (itemsHistory) {
    return res.status(403).json({ err: "Title already exists" });
  } else {
    Product.create(item)
      .then((products) => {
        res.status(200).send({ products });
      })
      .catch((err) => res.status(404).json({ message: err.message }));
  }
};

exports.updateItem = async (req, res) => {
  Product.updateOne({ _id: req.params.id }).exec(function (err, result) {
    res.status(200).send({ success: true });
    if (err) {
      return err;
    }
  });
};
exports.deleteItem = async (req, res) => {
  Product.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).send({ success: true }))
    .catch((err) => res.status(404).json({ message: err.message }));
};

exports.deleteManyItems = async (req, res) => {
  const arrOfIds = req.body;
  const Item = await Product.deleteMany(arrOfIds[0])
    .then((items) => res.status(200).send({ success: true }))
    .catch((err) => res.status(404).json({ message: err.message }));
};

// Categories CRUD
