const db = require("../models");
const { client: Client } = db;

const getClients = async (req, res) => {
  try {
    const client = await Client.findAll();
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createClient = async (req, res) => {
  try {
    const { rut, businessName, alias } = req.body;
    await Client.create({
      rut: rut,
      business_name: businessName,
      alias: alias,
    });

    const updatedClients = await Client.findAll();
    res.status(200).json(updatedClients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.body.id);
    client.rut = req.body.rut;
    client.business_name = req.body.businessName;
    client.alias = req.body.alias;
    await client.save();

    const updatedClients = await Client.findAll();
    res.status(200).json(updatedClients);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" });
  }
};

const clientController = {
  getClients,
  createClient,
  editClient,
};

module.exports = clientController;
