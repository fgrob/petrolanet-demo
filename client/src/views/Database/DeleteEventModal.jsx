import React, { useState } from "react";
import eventLogService from "../../services/eventLog.service";

const DeleteEventModal = ({
  event,
  toggleModal,
  fetchEventLogs,
  filters,
  setFilters,
  setIsTableReloading,
  startDate,
  endDate,
}) => {
  const [apiError, setApiError] = useState("");

  const handleDelete = (eventId) => {
    eventLogService
      .deleteEvent(eventId)
      .then(() => {
        setIsTableReloading(true);
        toggleModal();
        setApiError("");
        fetchAndFilter();
      })
      .catch((err) => {
        setApiError(err.response.data.message);
      });
  };

  const fetchAndFilter = async () => {
    const prevFilters = { ...filters };
    await fetchEventLogs(startDate, endDate);
    setFilters(prevFilters);
    setIsTableReloading(false);
  };

  return (
    <div className="mt-10">
      <div className="text-center font-bold text-red-500">
        Eliminar evento ID {event.id} ?
      </div>
      <div className=" mt-5 flex w-full justify-center gap-3">
        <button
          className="btn-error-small h-fit w-1/2 py-1"
          onClick={toggleModal}
        >
          Cancelar
        </button>
        <button
          className="btn-success-small h-fit w-1/2 py-1"
          onClick={() => handleDelete(event.id)}
        >
          Confirmar
        </button>
      </div>
      <div className="mt-2 w-full text-center font-bold text-red-500">
        {apiError}
      </div>
    </div>
  );
};

export default DeleteEventModal;
