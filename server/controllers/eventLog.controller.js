const db = require("../models");
const { Op } = require("sequelize");
const moment = require("moment-timezone");
const {
  CLIENT_OPERATION_ID,
  SUPPLIER_OPERATION_ID,
  TRANSFER_OPERATION_ID,
  MEASUREMENT_OPERATION_ID,
  ADJUSTMENT_OPERATION_ID,
  CHECK_OPERATION_ID,
} = require("../utils/constants");

const {
  eventLog: EventLog,
  operation: Operation,
  tank: Tank,
  client: Client,
  supplier: Supplier,
  originaleventbackup: OriginalEventsBackup,
} = db;

const getEventLogs = async (req, res) => {

  try {
    let startDate;
    let endDate;
    let tankIdFilter = null; // null is for events in all tanks

    if (req.query.startDate) {
      // It receives a time according to the 'Chile' timezone.. We bring it to the beginning of the day, and then convert it to UTC because we use UTC in the database.
      startDate = moment(req.query.startDate).startOf("day").utc();
    }

    if (!startDate) {
      // If no start date is specified, then set it to the beginning of the current day.
      startDate = moment
        .tz("America/Santiago")
        .startOf("day")
        .utc();
    }

    if (req.query.endDate) {
      endDate = moment(req.query.endDate).endOf("day").utc();
    }

    if (!endDate) {
      // If there is no date specified, we set it to the end of the current day.
      endDate = moment.tz("America/Santiago").endOf("day").utc();
    }

    if (req.query.tankId) {
      tankIdFilter = parseInt(req.query.tankId);
    }

    const eventLogs = await EventLog.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
        ...(tankIdFilter !== null && { tank_id: tankIdFilter }), // Condition: Filter by tank ID if defined.
      },
      include: [
        {
          model: Operation,
          as: "operation",
          attributes: ["id", "name"],
        },
        {
          model: Tank,
          as: "tank",
          attributes: ["id", "name", "type"],
        },
        {
          model: Client,
          as: "client",
          attributes: ["id", "rut", "business_name"],
        },
        {
          model: Supplier,
          as: "supplier",
          attributes: ["id", "rut", "business_name"],
        },
      ],
      attributes: {
        exclude: [
          "operation_id",
          "client_id",
          "supplier_id",
          "tank_id",
          "updatedAt",
        ],
      },
    });
    res.json(eventLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLastErrorEvents = async (req, res) => {
  try {
    const tanks = await Tank.findAll();
    const eventLogs = [];

    for (const tank of tanks) {
      if (tank.error_quantity !== 0) {
        const lastEvent = await EventLog.findOne({
          where: {
            operation_id: MEASUREMENT_OPERATION_ID,
            tank_id: tank.id,
          },
          order: [["createdAt", "DESC"]],
          limit: 1,
          include: [
            {
              model: Tank,
              as: "tank",
              attributes: ["name", "type"],
            },
          ],
        });

        lastEvent && eventLogs.push(lastEvent);
      }
    }
    res.status(200).json(eventLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMeasurementEvents = async (req, res) => {
  try {
    const tankId = req.query.tankId;
    const events = await EventLog.findAll({
      where: {
        tank_id: tankId,
        [Op.or]: [
          {
            operation_id: MEASUREMENT_OPERATION_ID,
          },
          {
            [Op.and]: [
              { operation_id: ADJUSTMENT_OPERATION_ID },
              {
                measured_balance: { [Op.ne]: null },
              },
            ],
          },
        ],
      },
      order: [["id", "DESC"]],
      limit: 30,
      include: [
        {
          model: Operation,
          as: "operation",
          attributes: ["id", "name"],
        },
      ]
    });

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editEvent = async (req, res) => {
  const data = req.body.changedDataObject;

  let event;
  let originalEventWithoutModification;
  let transactionCorrectionAmount = 0;
  let tankNumberCorrectionAmount = 0;

  async function findRelatedEvents(event, t) {
    const relatedEvents = await EventLog.findAll({
      where: {
        tank_id: event.tank_id,
        id: { [db.Sequelize.Op.gt]: event.id },
      },
      order: [["id", "ASC"]],
      transaction: t,
    });
    return relatedEvents;
  }

  function updateRelatedEvents(relatedEvents) {
    if (relatedEvents.length === 0) {
      return relatedEvents;
    }

    const restrictions = {
      adjustBalance: true,
      adjustTankNumber: true,
    };

    if (transactionCorrectionAmount == 0) {
      restrictions.adjustBalance = false;
      restrictions.adjustErrorQuantity = false;
    }
    if (tankNumberCorrectionAmount == 0) {
      restrictions.adjustTankNumber = false;
    }

    function updateRestrictions(relatedEvent) {
      // Stops corrections if certain criteria are met.

      // Balance corrections
      if (restrictions.adjustBalance) {
        // if is an Adjustment event and if there is changes in transaction_quantity
        if (
          relatedEvent.operation_id == ADJUSTMENT_OPERATION_ID &&
          relatedEvent.transaction_quantity != 0
        ) {
          relatedEvent.transaction_quantity -= transactionCorrectionAmount; // adjust the transaction to make it consistent
          restrictions.adjustBalance = false;
        }
      }

      // Tank Number corrections
      if (restrictions.adjustTankNumber) {
        // if is an Adjustment event and if there is a variation in the tank_number
        if (
          relatedEvent.operation_id == ADJUSTMENT_OPERATION_ID &&
          relatedEvent.tank_number_variation != 0
        ) {
          relatedEvent.tank_number_variation -= tankNumberCorrectionAmount;
          restrictions.adjustTankNumber = false;
        }
      }
    }

    // Execute the corrections:
    for (const relatedEvent of relatedEvents) {
      updateRestrictions(relatedEvent);
      if (
        !restrictions.adjustBalance &&
        !restrictions.adjustTankNumber &&
        !restrictions.adjustErrorQuantity
      ) {
        break;
      }
      if (restrictions.adjustBalance) {
        relatedEvent.balance += transactionCorrectionAmount;
        if (relatedEvent.operation_id == MEASUREMENT_OPERATION_ID) {
          relatedEvent.error_quantity =
            relatedEvent.measured_balance - relatedEvent.balance;
        }
      }
      if (restrictions.adjustTankNumber && relatedEvent.tank_number_to_date) {
        relatedEvent.tank_number_to_date += tankNumberCorrectionAmount;
      }
    }
    return relatedEvents;
  }

  async function getReferenceEvent(
    event,
    {
      previousEvent = false,
      tankNumberConditions = false,
      errorQuantityConditions = false,
    } = {},
    t
  ) {
    const defaultConditions = {
      tank_id: event.tank_id,
    };

    let conditions = { ...defaultConditions };

    if (previousEvent) {
      conditions = {
        ...conditions,
        id: { [db.Sequelize.Op.lt]: event.id },
      };
    }

    if (tankNumberConditions) {
      conditions = {
        ...conditions,
        [Op.or]: [
          { operation_id: { [Op.ne]: ADJUSTMENT_OPERATION_ID } },
          {
            [Op.and]: [
              { operation_id: ADJUSTMENT_OPERATION_ID },
              { tank_number_to_date: { [Op.ne]: 0 } },
            ],
          },
        ],
      };
    }

    if (errorQuantityConditions) {
      conditions = {
        ...conditions,
        [Op.or]: [
          {
            operation_id: MEASUREMENT_OPERATION_ID,
          },
          {
            [Op.and]: [
              { operation_id: ADJUSTMENT_OPERATION_ID },
              { measured_balance: { [Op.ne]: null } },
            ],
          },
        ],
      };
    }

    return await EventLog.findOne({
      where: conditions,
      order: [["id", "DESC"]],
      transaction: t,
    });
  }

  // Start the transaction
  try {
    // Events update
    await db.sequelize.transaction(async (t) => {
      event = await EventLog.findByPk(data.id.value);
      originalEventWithoutModification = { ...event.get({ plain: true }) };

      // UPDATE CURRENT EVENT
      // balance, tank number & eventId* corrections
      if (!data.tank.change) {
        transactionCorrectionAmount =
          parseInt(data.transaction_quantity.value) -
          parseInt(event.transaction_quantity);
        if (data.tank_number_to_date.change) {
          tankNumberCorrectionAmount = parseInt(
            data.tank_number_variation.value
          );
        } else {
          tankNumberCorrectionAmount =
            parseInt(data.tank_number_variation.value) -
            parseInt(event.tank_number_variation);
        }
        event.balance += transactionCorrectionAmount;
        event.tank_number_to_date += tankNumberCorrectionAmount;
      } else {
        event.tank_id = data.tank.value;
        // Look for the balance and numeral values in the immediate preceding event that meets certain conditions.
        const referenceEventForBalance = await getReferenceEvent(
          event,
          { previousEvent: true },
          t
        );
        event.balance =
          referenceEventForBalance.balance +
          parseInt(data.transaction_quantity.value);

        const referenceEventForTankNumber = await getReferenceEvent(
          event,
          { previousEvent: true, tankNumberConditions: true },
          t
        );
        event.tank_number_to_date =
          referenceEventForTankNumber.tank_number_to_date +
          parseInt(data.tank_number_variation.value);

        // undo the transaction from all related events:
        const relatedEvents = await findRelatedEvents(
          originalEventWithoutModification,
          t
        );
        transactionCorrectionAmount =
          originalEventWithoutModification.transaction_quantity * -1;
        tankNumberCorrectionAmount =
          originalEventWithoutModification.tank_number_variation * -1;

        const updatedRelatedTankEvents = updateRelatedEvents(relatedEvents);
        await Promise.all(
          updatedRelatedTankEvents.map((relatedEvent) =>
            relatedEvent.save({ transaction: t })
          )
        );

        transactionCorrectionAmount = parseInt(data.transaction_quantity.value);
        tankNumberCorrectionAmount = parseInt(data.tank_number_variation.value);
      }

      // clientSupplier, documents, transaction & tank number variation, notes corrections
      data.client.change && (event.client_id = data.client.value);
      data.supplier.change && (event.supplier_id = data.supplier.value);

      data.document_type.change &&
        (event.document_type = data.document_type.value);
      data.document_number.change &&
        (event.document_number = data.document_number.value);

      data.transaction_quantity.change &&
        (event.transaction_quantity = data.transaction_quantity.value);
      event.tank_number_variation = data.tank_number_variation.value; // It does not require verification of .change because it can vary indirectly.

      if (data.measured_balance.change) {
        event.measured_balance = data.measured_balance.value;
        event.error_quantity = event.measured_balance - event.balance;
      }
      data.notes.change && (event.notes = data.notes.value);

      await event.save({ transaction: t });

      //UPDATE ALL POSTERIOR RELATED EVENTS
      const relatedEvents = await findRelatedEvents(event, t);
      const updatedRelatedTankEvents = updateRelatedEvents(relatedEvents);
      await Promise.all(
        updatedRelatedTankEvents.map((relatedEvent) =>
          relatedEvent.save({ transaction: t })
        )
      );
    });

    // Tanks updates
    await db.sequelize.transaction(async (t2) => {
      // It is a new transaction since it requires the events to have updated information.

      // Update previous Tank
      if (data.tank.change) {
        const latestEventForBalance = await getReferenceEvent(
          originalEventWithoutModification,
          t2
        );
        const latestEventForTankNumber = await getReferenceEvent(
          originalEventWithoutModification,
          { tankNumberConditions: true },
          t2
        );

        const latestEventForErrorQuantity = await getReferenceEvent(
          originalEventWithoutModification,
          { errorQuantityConditions: true },
          t2
        );

        const tank = await Tank.findByPk(
          originalEventWithoutModification.tank_id
        );
        tank.current_quantity = latestEventForBalance.balance;
        tank.tank_number = latestEventForTankNumber.tank_number_to_date;
        tank.error_quantity = latestEventForErrorQuantity
          ? latestEventForErrorQuantity.error_quantity
          : 0;
        await tank.save({ transaction: t2 });
      }

      // Update Tank
      const latestEventForBalance = await getReferenceEvent(event, t2);
      const latestEventForTankNumber = await getReferenceEvent(event, {
        tankNumberConditions: true,
        t2,
      });
      const latestEventForErrorQuantity = await getReferenceEvent(event, {
        errorQuantityConditions: true,
        t2,
      });

      const tank = await Tank.findByPk(event.tank_id);

      tank.current_quantity = latestEventForBalance.balance;
      tank.tank_number = latestEventForTankNumber.tank_number_to_date;

      tank.error_quantity = latestEventForErrorQuantity
        ? latestEventForErrorQuantity.error_quantity
        : 0;

      await tank.save({ transaction: t2 });

      // Save the original event without changes in the EditedEvents table.
      await OriginalEventsBackup.create({
        original_event_id: event.id,
        operation_id: originalEventWithoutModification.operation_id,
        user: originalEventWithoutModification.user,
        tank_id: originalEventWithoutModification.tank_id,
        transaction_quantity:
          originalEventWithoutModification.transaction_quantity,
        balance: originalEventWithoutModification.balance,
        measured_balance: originalEventWithoutModification.measured_balance,
        error_quantity: originalEventWithoutModification.error_quantity,
        tank_number_to_date:
          originalEventWithoutModification.tank_number_to_date,
        document_type: originalEventWithoutModification.document_type,
        document_number: originalEventWithoutModification.document_number,
        client_id: originalEventWithoutModification.client_id,
        supplier_id: originalEventWithoutModification.supplier_id,
        notes: originalEventWithoutModification.notes,
        tank_number_variation:
          originalEventWithoutModification.tank_number_variation,
      });
    });

    // Finally, outside of the transactions, we send the updated tanks.
    const updatedTanks = await Tank.findAll();
    const io = req.app.get("io");
    const socketId = req.headers.socketid;
    const socket = io.sockets.sockets.get(socketId);
    socket.broadcast.emit("updatedTanks", updatedTanks);

    res.status(200).json(updatedTanks);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "An error has ocurred in the transaction" });
  }
};

const deleteEvent = async (req, res) => {
  const event_id = req.params.eventId;

  function isEventDeletable(event) {
    const validOperationIds = [
      CLIENT_OPERATION_ID,
      SUPPLIER_OPERATION_ID,
      TRANSFER_OPERATION_ID,
      CHECK_OPERATION_ID,
    ];

    return (
      validOperationIds.includes(event.operation_id) &&
      event.transaction_quantity == 0
    );
  }

  try {
    const event = await EventLog.findByPk(event_id);

    if (isEventDeletable(event)) {
      await EventLog.destroy({
        where: {
          id: event_id,
        },
      });
      res.status(200).json({ message: "Deletion OK" });
    } else {
      return res
        .status(500)
        .json({ message: "The event cannot be deleted" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error has ocurred in the destroy request" });
  }
};

const eventLogController = {
  getEventLogs,
  getLastErrorEvents,
  getMeasurementEvents,
  editEvent,
  deleteEvent,
};

module.exports = eventLogController;
