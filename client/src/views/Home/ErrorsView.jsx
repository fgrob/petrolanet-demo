import React, { useEffect, useState } from "react";
import eventLogService from "../../services/eventLog.service";
import moment from "moment-timezone";
import ModalSimple from "../../components/ModalSimple";
import { MdOutlineComment } from "react-icons/md";
import { BiLoaderCircle } from "react-icons/bi";

const ErrorsView = ({ setHeight }) => {
  const [eventLogs, setEventLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openNotesModal, setOpenNotesModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [apiError, setApiError] = useState("");

  const getEventLogs = () => {
    eventLogService
      .getLastErrorEvents()
      .then((res) => {
        setEventLogs(res.data);
        setIsLoading(false);
      })
      .catch((err) => setApiError(err.message));
  };

  const handleOpenNote = (note) => {
    setSelectedNote(note);
    toggleNotesModal();
  };

  const toggleNotesModal = () => {
    setOpenNotesModal(!openNotesModal);
  };

  useEffect(() => {
    setHeight("h-auto");
    getEventLogs();
  }, []);

  return (
    <div className="overflow-hidden text-center">
      <div className="mb-2 text-2xl text-ocean-green-500">
        Mediciones de estanque
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <BiLoaderCircle className="animate-spin text-2xl text-blue-500" />
        </div>
      ) : (
        <div className="max-h-96 w-full overflow-auto rounded-md shadow-md landscape:h-4/5">
          <table className="table-auto divide-y divide-gray-200">
            <thead className="sticky top-0 bg-gradient-to-r from-ocean-green-900 to-ocean-green-500 text-white">
              <tr className="text-xs uppercase tracking-wider">
                <th className="px-14 py-3 text-start">FECHA</th>
                <th className="px-14 py-3 text-start">ESTANQUE</th>
                <th className="whitespace-nowrap px-6 py-3 text-start">
                  SALDO A LA FECHA
                </th>
                <th className="px-6 py-3 text-start">REGLA</th>
                <th className="px-6 py-3 text-start">DIFERENCIA</th>
                <th className="px-6 py-3 text-start">NOTAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {eventLogs.map((eventLog, index) => (
                <tr
                  key={eventLog.id}
                  className={index % 2 === 0 ? "" : "bg-gray-100"}
                >
                  <td>
                    {moment(eventLog.createdAt)
                      .tz("America/Santiago")
                      .format("DD/MM/yyyy - HH:mm")}
                  </td>
                  <td>{eventLog.tank.name}</td>
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
      {openNotesModal && (
        <ModalSimple content={selectedNote} toggleModal={toggleNotesModal} />
      )}
    </div>
  );
};

export default ErrorsView;
