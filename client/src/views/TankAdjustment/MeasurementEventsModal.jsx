import React, { useEffect, useState } from "react";
import eventLogService from "../../services/eventLog.service";
import moment from "moment-timezone";
import { BiLoaderCircle } from "react-icons/bi";
import { MdOutlineComment } from "react-icons/md";
import { operationColorMap } from "../../utils/formatting";

const MeasurementEventsModal = ({ tankId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const [apiError, setApiError] = useState("");

  const getMeasurementEvents = () => {
    eventLogService
      .getMeasurementEvents(tankId)
      .then((res) => {
        setEvents(res.data);
        setIsLoading(false);
      })
      .catch((err) =>
        setApiError(err.response?.data.message || "Error. No response"),
      );
  };

  useEffect(() => {
    getMeasurementEvents();
  }, []);

  return (
    <div className="max-h-screen overflow-hidden">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <BiLoaderCircle className="animate-spin text-2xl text-blue-500" />
        </div>
      ) : (
        <div className="mt-5 h-full w-full overflow-auto rounded-md shadow-md">
          <table className="mb-10 table-auto divide-y divide-gray-200 text-center">
            <thead className="sticky top-0 bg-gradient-to-r from-ocean-green-900 to-ocean-green-500 text-white">
              <tr className="text-xs uppercase tracking-wider">
                <th className="px-14 py-3 text-start">FECHA</th>
                <th className="py-3 text-start">OPERACIÓN</th>
                <th className="py-3 text-start">MOVIMIENTO</th>
                <th className="whitespace-nowrap px-6 py-3 text-start">
                  SALDO A LA FECHA
                </th>
                <th className="px-2 py-3 text-start">REGLA</th>
                <th className="px-2 py-3 text-start">DIFERENCIA</th>
                <th className="px-2 py-3 text-start">NOTAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {events.map((eventLog, index) => (
                <tr
                  key={eventLog.id}
                  className={index % 2 === 0 ? "" : "bg-gray-100"}
                >
                  <td>
                    {moment(eventLog.createdAt)
                      .tz("America/Santiago")
                      .format("DD/MM/yyyy - HH:mm")}
                  </td>
                  <td
                    className={`${
                      operationColorMap[eventLog.operation.id]
                    } whitespace-nowrap text-sm text-gray-900`}
                  >
                    {eventLog.operation.name}
                  </td>
                  <td>
                    {eventLog.transaction_quantity.toLocaleString("es-CL")}
                  </td>
                  <td>{eventLog.balance.toLocaleString("es-CL")}</td>
                  <td>{eventLog.measured_balance.toLocaleString("es-CL")}</td>
                  <td
                    className={`${
                      eventLog.error_quantity < 0
                        ? "text-red-500"
                        : "text-ocean-green-500"
                    } font-bold`}
                  >
                    {eventLog.error_quantity.toLocaleString("es-CL")}
                  </td>
                  <td>
                    {eventLog.notes && (
                      <div className="flex items-center justify-center">
                        <button onClick={() => handleOpenNote(eventLog.notes)}>
                          <MdOutlineComment />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center text-red-600">{apiError}</div>
        </div>
      )}
    </div>
  );
};

export default MeasurementEventsModal;
