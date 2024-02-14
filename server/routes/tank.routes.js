const tankController = require("../controllers/tank.controller");

module.exports = function (app) {
  app.get("/api/tank/all", tankController.getTanks);
  app.put(
    "/api/tank/transfer",
    tankController.transferOperation
  );
  app.put(
    "/api/tank/sellorsupply",
    tankController.sellOrSupplyOperation
  );
  app.put(
    "/api/tank/measurement",
    tankController.measurementOperation
  );
  app.put(
    "/api/tank/adjustment",
    tankController.adjustmentOperation
  );
  app.post(
    "/api/tank/create",
    tankController.createTank
  );
  app.post(
    "/api/tank/checktanknumber",
    tankController.checkTankNumber
  );
};
