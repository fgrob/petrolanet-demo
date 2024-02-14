const supplierController = require("../controllers/supplier.controller");

module.exports = function (app) {
  app.get(
    "/api/supplier/all",
    supplierController.getSuppliers
  );
  app.post(
    "/api/supplier/create",
    supplierController.createSupplier
  );
  app.put(
    "/api/supplier/edit",
    supplierController.editSupplier
  );
};
