const clientController = require("../controllers/client.controller");

module.exports = function (app) {
  app.get(
    "/api/client/all",
    clientController.getClients
  );
  app.post(
    "/api/client/adjustments/create",
    clientController.createClient
  );
  app.put(
    "/api/client/adjustments/edit",
    clientController.editClient
  );
};
