import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import moment from "moment-timezone";
import Modal from "../../components/Modal";
import EditEventModal from "./EditEventModal";
import DeleteEventModal from "./DeleteEventModal";
import { BiLoaderCircle } from "react-icons/bi";
import { MdOutlineComment } from "react-icons/md";
import { AiTwotoneSetting } from "react-icons/ai";
import { TiDelete } from "react-icons/ti";
import { operationColorMap } from "../../utils/formatting";
import {
  CHECK_OPERATION_ID,
  CLIENT_OPERATION_ID,
  SUPPLIER_OPERATION_ID,
  TRANSFER_OPERATION_ID,
} from "../../utils/constants";

const DatabaseTable = ({
  filteredEventLogs,
  isTableReloading,
  fetchEventLogs,
  filters,
  setFilters,
  setIsTableReloading,
  startDate,
  endDate,
}) => {
  const { openBackdrop, setOpenBackdrop } = useContext(AppContext);
  const [openNotesModal, setOpenNotesModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [clickedRowId, setClickedRowId] = useState(null);

  const [openEditionModal, setOpenEditionModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleOpenNote = (note) => {
    setSelectedNote(note);
    toggleNotesModal();
  };

  const toggleNotesModal = () => {
    setOpenNotesModal(!openNotesModal);
    setOpenBackdrop(!openBackdrop);
  };

  const handleOpenEdition = (event) => {
    setEventToEdit(event);
    toggleEditionModal();
  };

  const toggleEditionModal = () => {
    setOpenEditionModal(!openEditionModal);
    setOpenBackdrop(!openBackdrop);
  };

  const handleOpenDeleteModal = (event) => {
    setEventToEdit(event);
    toggleDeleteModal();
  };

  const toggleDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
    setOpenBackdrop(!openBackdrop);
  };

  const handleRowClick = (id) => {
    if (id === clickedRowId) {
      setClickedRowId(null);
    } else {
      setClickedRowId(id);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {isTableReloading ? (
        <div className="flex h-full items-center justify-center">
          <BiLoaderCircle className="animate-spin text-2xl text-blue-500" />
        </div>
      ) : (
        <table className="w-full table-auto  divide-y divide-gray-200 overflow-scroll ">
          <thead className="sticky top-0 bg-gradient-to-r from-ocean-green-900 to-ocean-green-500 text-white">
            <tr className="text-xs uppercase tracking-wider">
              <th className="hidden px-6 py-3 md:block">ID</th>
              <th className="px-6 py-3 text-start">Fecha</th>
              <th className="px-6 py-3 text-start">Operación</th>
              <th className="px-6 py-3 text-start">Usuario</th>
              <th className="px-6 py-3 text-start">Estanque</th>
              <th className="px-6 py-3 text-start">Movimiento</th>
              <th className="px-6 py-3 text-start">Saldo</th>
              <th className="px-6 py-3 text-start">Regla</th>
              <th className="px-6 py-3 text-start">Diferencia</th>
              <th className="px-6 py-3 text-start">Numeral</th>
              <th className="px-6 py-3 text-start">Var Num</th>
              <th className="px-6 py-3 text-start">Documento</th>
              <th className="px-6 py-3 text-start">Folio</th>
              <th className="px-6 py-3 text-start">Cliente / Proveedor</th>
              <th className="px-6 py-3 text-start">Notas</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredEventLogs
              .sort((a, b) => b.id - a.id)
              .map((eventLog, index) => (
                <tr
                  key={eventLog.id}
                  className={`
                        ${index % 2 === 0 ? "" : "bg-gray-100"}
                        ${
                          eventLog.operation.id === 6 &&
                          clickedRowId !== eventLog.id
                            ? "bg-orange-200 font-bold"
                            : ""
                        }
                        ${clickedRowId === eventLog.id ? "bg-gray-300" : ""}
                    `}
                  onClick={() => handleRowClick(eventLog.id)}
                >
                  <td className="hidden whitespace-nowrap px-6 text-sm text-gray-900 md:block">
                    {eventLog.id}
                  </td>
                  <td className="whitespace-nowrap px-6 text-sm text-gray-900">
                    {moment(eventLog.createdAt)
                      .tz("America/Santiago")
                      .format("DD/MM/yyyy - HH:mm")}
                  </td>
                  <td
                    className={`${
                      operationColorMap[eventLog.operation.id]
                    } whitespace-nowrap px-6 text-sm text-gray-900`}
                  >
                    {eventLog.operation.name}
                  </td>
                  <td className="whitespace-nowrap px-6 text-sm text-gray-900">
                    {eventLog.user}
                  </td>
                  <td className="whitespace-nowrap px-6 text-sm font-bold text-gray-900">
                    {eventLog.tank.name}
                  </td>
                  <td className="whitespace-nowrap px-6 text-end text-sm text-gray-900">
                    {parseInt(eventLog.transaction_quantity).toLocaleString(
                      "es-CL",
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 text-end text-sm text-gray-900">
                    {parseInt(eventLog.balance).toLocaleString("es-CL")}
                  </td>
                  <td className="whitespace-nowrap px-6 text-end text-sm text-gray-900">
                    {eventLog.measured_balance &&
                      parseInt(eventLog.measured_balance).toLocaleString(
                        "es-CL",
                      )}
                  </td>
                  <td className="whitespace-nowrap px-6 text-end text-sm text-gray-900">
                    <span
                      className={`${
                        eventLog.error_quantity < 0
                          ? "font-bold text-red-500"
                          : "font-bold text-green-500"
                      }`}
                    >
                      {eventLog.error_quantity && (
                        <span>
                          {parseInt(eventLog.error_quantity).toLocaleString(
                            "es-CL",
                          )}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 text-end text-sm text-gray-900">
                    {eventLog.tank_number_to_date != 0 && (
                      <div>
                        {eventLog.operation.id == 3 &&
                        eventLog.tank_number_variation == 0 &&
                        eventLog.transaction_quantity < 0 ? (
                          <span
                            title="Transferencia directa no modifica numeral"
                            className="bg-yellow-200"
                          >
                            {eventLog.tank_number_to_date}
                          </span>
                        ) : (
                          <span>{eventLog.tank_number_to_date}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 text-end text-sm text-gray-900">
                    {eventLog.tank_number_variation}
                  </td>
                  <td className="whitespace-nowrap px-6 text-sm text-gray-900">
                    {eventLog.document_type}
                  </td>
                  <td className="whitespace-nowrap px-6 text-end text-sm text-gray-900">
                    {eventLog.document_number}
                  </td>
                  <td className="whitespace-nowrap px-6 text-sm text-gray-900">
                    {eventLog.client
                      ? eventLog.client.business_name
                      : eventLog.supplier && eventLog.supplier.business_name}
                  </td>
                  <td className="whitespace-nowrap text-gray-900">
                    {eventLog.notes && (
                      <div className="flex items-center justify-center">
                        <button onClick={() => handleOpenNote(eventLog.notes)}>
                          <MdOutlineComment />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-gray-900">
                    {eventLog.operation.id != CHECK_OPERATION_ID && (
                      <button
                        onClick={() => handleOpenEdition(eventLog)}
                        title="Editar evento"
                      >
                        <AiTwotoneSetting />
                      </button>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-gray-900">
                    {eventLog.transaction_quantity == 0 &&
                      (eventLog.operation.id == CLIENT_OPERATION_ID ||
                        eventLog.operation.id == SUPPLIER_OPERATION_ID ||
                        eventLog.operation.id == TRANSFER_OPERATION_ID ||
                        eventLog.operation.id == CHECK_OPERATION_ID) && (
                        <button
                          onClick={() => handleOpenDeleteModal(eventLog)}
                          className="ml-1 text-red-500"
                          title="Eliminar evento"
                        >
                          <TiDelete />
                        </button>
                      )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
      <Modal
        openModal={openNotesModal}
        toggleModal={toggleNotesModal}
        height="h-auto"
      >
        <div className="overflow-hidden whitespace-normal break-words p-5">
          {selectedNote}
        </div>
      </Modal>
      {openEditionModal && (
        <Modal
          openModal={openEditionModal}
          toggleModal={toggleEditionModal}
          height="h-auto max-h-full"
        >
          <div className="mx-5 overflow-auto whitespace-normal break-words">
            <EditEventModal
              event={eventToEdit}
              toggleModal={toggleEditionModal}
              fetchEventLogs={fetchEventLogs}
              filters={filters}
              setFilters={setFilters}
              setIsTableReloading={setIsTableReloading}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </Modal>
      )}
      {openDeleteModal && (
        <Modal
          openModal={openDeleteModal}
          toggleModal={toggleDeleteModal}
          height="h-auto"
        >
          <DeleteEventModal
            event={eventToEdit}
            toggleModal={toggleDeleteModal}
            fetchEventLogs={fetchEventLogs}
            filters={filters}
            setFilters={setFilters}
            setIsTableReloading={setIsTableReloading}
            startDate={startDate}
            endDate={endDate}
          />
        </Modal>
      )}
    </div>
  );
};

export default DatabaseTable;
