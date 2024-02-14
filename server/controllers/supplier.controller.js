const db = require("../models");
const { supplier: Supplier } = db;

const getSuppliers = async (req, res) => {
  try {
    const supplier = await Supplier.findAll();
    res.json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { rut, businessName, alias } = req.body;
    await Supplier.create({
      rut: rut,
      business_name: businessName,
      alias: alias,
    });

    const updatedSuppliers = await Supplier.findAll();
    res.status(200).json(updatedSuppliers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.body.id);
    supplier.rut = req.body.rut;
    supplier.business_name = req.body.businessName;
    supplier.alias = req.body.alias;
    await supplier.save();

    const updatedSuppliers = await Supplier.findAll();
    res.status(200).json(updatedSuppliers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const supplierController = {
  getSuppliers,
  createSupplier,
  editSupplier,
};

module.exports = supplierController;
