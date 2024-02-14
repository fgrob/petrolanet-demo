const eventLogController = require("../controllers/eventLog.controller");

module.exports = function (app) {
  app.get(
    "/api/eventlog/all",
    eventLogController.getEventLogs
  );
  app.get(
    "/api/eventlog/errors",
    eventLogController.getLastErrorEvents
  );
  app.get(
    "/api/eventlog/measurementevents",
    eventLogController.getMeasurementEvents
  );

  app.put(
    "/api/eventlog/editevent",
    eventLogController.editEvent
  );
  app.delete(
    "/api/eventlog/delete/:eventId",
    eventLogController.deleteEvent
  );
};
