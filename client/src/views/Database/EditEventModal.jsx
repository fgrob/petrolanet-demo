import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../App";
import Autocomplete from "../../components/Autocomplete";
import eventLogService from "../../services/eventLog.service";
import clientService from "../../services/client.service";
import supplierService from "../../services/supplier.service";
import { BiSolidCheckCircle } from "react-icons/bi";
import { BiLoaderCircle } from "react-icons/bi";
import { operationColorMap } from "../../utils/formatting";
import {
  documentOptions,
  SUPPLIER_OPERATION_ID,
  CLIENT_OPERATION_ID,
  TRANSFER_OPERATION_ID,
  ADJUSTMENT_OPERATION_ID,
  MEASUREMENT_OPERATION_ID,
} from "../../utils/constants";

const EditEventModal = ({
  event,
  toggleModal,
  fetchEventLogs,
  filters,
  setFilters,
  setIsTableReloading,
  startDate,
  endDate,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { tanks, setTanks } = useContext(AppContext);
  const [changedDataObject, setChangedDataObject] = useState({});

  const [directTransfer, setDirectTransfer] = useState(false);
  const [clientSupplierList, setClientSupplierList] = useState([]);
  const [rut, setRut] = useState("");
  const [clientSupplier, setClientSupplier] = useState("");
  const [autocompleteError, setAutocompleteError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(documentOptions[0]);
  const [documentNumber, setDocumentNumber] = useState("");

  const [apiError, setApiError] = useState("");

  const createChangedDataObject = () => {
    const changedData = {};
    for (const [key, value] of Object.entries(event)) {
      changedData[key] = {
        change: false,
        value: value?.id ? value.id : value,
      };
    }
    setChangedDataObject(changedData);
    return changedData;
  };

  const checkIfDirectTransfer = (changedDataObject) => {
    if (
      changedDataObject["operation"].value == TRANSFER_OPERATION_ID &&
      changedDataObject["tank_number_variation"].value == 0
    ) {
      setDirectTransfer(true);
    }
  };

  const checkIfClientSupplier = (changedDataObject) => {
    const operation = changedDataObject["operation"].value;

    if (
      operation == CLIENT_OPERATION_ID ||
      operation == SUPPLIER_OPERATION_ID
    ) {
      setSelectedDocument(event.document_type);

      if (operation == CLIENT_OPERATION_ID) {
        clientService
          .getClients("inputs")
          .then((res) => {
            setClientSupplierList(res.data);
            setRut(event.client.rut);
            setClientSupplier(event.client.business_name);
          })
          .catch((err) => {
            setApiError(err.message);
          })
          .finally(() => {
            setIsLoading(false);
            return;
          });
      }

      if (operation == SUPPLIER_OPERATION_ID) {
        supplierService
          .getSuppliers("inputs")
          .then((res) => {
            setClientSupplierList(res.data);
            setRut(event.supplier.rut);
            setClientSupplier(event.supplier.business_name);
          })
          .catch((err) => {
            setApiError(err.message);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleDataChanges = (key, value) => {
    let isChange = false;
    let originalValue = event[key]?.id ? event[key].id : event[key];
    if (originalValue != value) {
      isChange = true;
    }

    const changedData = { ...changedDataObject };
    changedData[key].value = value;
    changedData[key].change = isChange;
    setChangedDataObject(changedData);
  };

  const handleTransactionQuantityVariation = (e) => {
    if (event.operation.id == CLIENT_OPERATION_ID && e.target.value > 0) {
      e.target.setCustomValidity(
        "El valor de una venta no puede ser mayor a cero",
      );
    } else {
      e.target.setCustomValidity("");
    }

    if (event.operation.id == SUPPLIER_OPERATION_ID && e.target.value < 0) {
      e.target.setCustomValidity(
        "El valor de una compra no puede ser menor a cero",
      );
    }

    handleDataChanges("transaction_quantity", e.target.value);
  };

  const handleTankNumberVariation = () => {
    if (directTransfer) {
      // case: TRANSFER OPERATION (OUT) without modifying tank_number
      changedDataObject["tank_number_variation"].value = 0;
    } else if (changedDataObject["tank_number_to_date"].change) {
      // case: ADJUSTMENT OPERATION, direct change to tank_number
      const variation =
        changedDataObject["tank_number_to_date"].value -
        event.tank_number_to_date;
      changedDataObject["tank_number_variation"].value = variation;
    } else if (
      changedDataObject["transaction_quantity"].value < 0 &&
      changedDataObject["tank_number_to_date"].value != 0
    ) {
      //case: ANY OUT TRANSACTION (<0). tank_number_to_date = 0 implies that it was an adjustment operation that did not modify the numeral
      changedDataObject["tank_number_variation"].value =
        changedDataObject["transaction_quantity"].value * -1;
    } else {
      changedDataObject["tank_number_variation"].value = 0;
    }
  };

  const handleClientSupplierVariation = () => {
    const findClientSupplierId = (rut) => {
      const clientSupplier = clientSupplierList.find(
        (clientSupplier) => clientSupplier.rut == rut,
      );
      return clientSupplier ? clientSupplier.id : null;
    };

    if (event.operation.id == CLIENT_OPERATION_ID) {
      const clientId = findClientSupplierId(rut);
      handleDataChanges("client", clientId);
      return;
    }
    if (event.operation.id == SUPPLIER_OPERATION_ID) {
      const supplierId = findClientSupplierId(rut);
      handleDataChanges("supplier", supplierId);
      return;
    }
    return;
  };

  const handleDocumentVariation = () => {
    if (
      event.operation.id == CLIENT_OPERATION_ID ||
      event.operation.id == SUPPLIER_OPERATION_ID
    ) {
      const documentTypeValue = selectedDocument ? selectedDocument : null;
      const documentNumberValue = documentNumber ? documentNumber : null;
      handleDataChanges("document_type", documentTypeValue);
      handleDataChanges("document_number", documentNumberValue);
    }
  };

  const handleConfirmation = (e) => {
    e.preventDefault();
    setIsTableReloading(true);
    handleClientSupplierVariation();
    handleTankNumberVariation();
    handleDocumentVariation();

    eventLogService
      .editEvent(changedDataObject)
      .then((res) => {
        setTanks(res.data);
        toggleModal();
        setApiError("");
        fetchAndFilter();
      })
      .catch((err) => {
        setApiError(err.message);
        setIsTableReloading(false);
      });
  };

  const fetchAndFilter = async () => {
    const prevFilters = { ...filters };
    await fetchEventLogs(startDate, endDate);
    normalizeFilters();
    setFilters(prevFilters);
    setIsTableReloading(false);
  };

  const normalizeFilters = (prevFilters) => {
    // The client supplier filters were created during the initial rendering based on the clients and suppliers that had registered events
    // If you switch to a client/supplier that is not in this initial filters list, then we add it manually. The same applies to document numbers and document types
    if (
      (changedDataObject["client"].change ||
        changedDataObject["supplier"].change) &&
      clientSupplier &&
      !prevFilters.clientSupplierFilters[clientSupplier]
    ) {
      prevFilters.clientSupplierFilters[clientSupplier] = true;
    }
    if (
      changedDataObject["document_number"].change &&
      documentNumber &&
      !prevFilters.document_number[documentNumber]
    ) {
      prevFilters.document_number[documentNumber] = true;
    }
    if (
      changedDataObject["document_type"].change &&
      selectedDocument &&
      !prevFilters.documentTypeFilters[selectedDocument]
    ) {
      prevFilters.document_type[selectedDocument] = true;
    }
  };

  useEffect(() => {
    const changedDataObject = createChangedDataObject();
    checkIfDirectTransfer(changedDataObject);
    checkIfClientSupplier(changedDataObject);
  }, []);

  useEffect(() => {
    selectedDocument === documentOptions[0]
      ? setDocumentNumber("")
      : event.document_number && setDocumentNumber(event.document_number);
  }, [selectedDocument]);

  return (
    <div>
      {!isLoading ? (
        <div className="m-2 flex w-[400px] flex-wrap overflow-hidden rounded p-2 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
          <h1
            className={`h-fit w-full rounded-lg p-1 text-2xl font-bold uppercase text-white ${
              operationColorMap[event.operation.id]
            }`}
          >
            {event.operation.name}
          </h1>
          <div className="w-full text-center font-bold">ID {event.id}</div>
          <hr className="divider" />

          <form
            className="flex flex-1 flex-col gap-1"
            onSubmit={(e) => handleConfirmation(e)}
          >
            <div className="flex flex-col items-center">
              {/* Type row */}
              <label htmlFor="tankSelector" className="w-full font-bold">
                Estanque
              </label>
              <div className="relative w-full">
                <select
                  id="tankSelector"
                  className="w-full border p-3"
                  value={changedDataObject.tank.value}
                  onChange={(e) => handleDataChanges("tank", e.target.value)}
                >
                  {tanks.map((tank) => (
                    <option key={tank.id} value={tank.id}>
                      {tank.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {changedDataObject["operation"].value !=
              MEASUREMENT_OPERATION_ID && (
              <div className="flex flex-col items-center">
                {/* transaction quantity row */}
                <label
                  htmlFor="transactionQuantityInput"
                  className="w-full font-bold"
                >
                  Movimiento
                </label>
                <div className="relative w-full">
                  <input
                    id="transactionQuantityInput"
                    className="w-full border p-3"
                    type="number"
                    value={changedDataObject["transaction_quantity"].value}
                    onChange={(e) => handleTransactionQuantityVariation(e)}
                  />
                </div>
              </div>
            )}

            {changedDataObject["operation"].value ==
              MEASUREMENT_OPERATION_ID && (
              <div className="flex flex-col items-center">
                {/* measurement quantity row */}
                <label
                  htmlFor="measurementQuantityInput"
                  className="w-full font-bold"
                >
                  Medición
                </label>
                <div className="relative w-full">
                  <input
                    id="measurementQuantityInput"
                    className="w-full border p-3"
                    type="number"
                    value={changedDataObject["measured_balance"].value}
                    onChange={(e) =>
                      handleDataChanges("measured_balance", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {changedDataObject["operation"].value == TRANSFER_OPERATION_ID &&
              changedDataObject["transaction_quantity"].value <= 0 && (
                <div className="flex items-center justify-center gap-1 text-center">
                  <input
                    type="checkbox"
                    checked={directTransfer}
                    onChange={() => setDirectTransfer(!directTransfer)}
                    className="form-checkbox focus:shadow-outline-red mr-1 h-4 w-4 self-center rounded border-gray-300 text-red-500 focus:outline-none"
                  />
                  <label
                    htmlFor="directTranfer"
                    className="font-bold text-red-500"
                  >
                    Transferencia Directa (no modifica Numeral)
                  </label>
                </div>
              )}

            {(changedDataObject["operation"].value == CLIENT_OPERATION_ID ||
              changedDataObject["operation"].value ==
                SUPPLIER_OPERATION_ID) && (
              // client supplier row
              <>
                <div className="w-full">
                  <label htmlFor="rut" className="block font-bold">
                    RUT
                  </label>
                  <Autocomplete
                    inputValue={rut}
                    setInputValue={setRut}
                    setClientSupplier={setClientSupplier}
                    suggestions={clientSupplierList.map((clientSupplier) => ({
                      value: clientSupplier.rut,
                      label: clientSupplier.business_name,
                    }))}
                    autocompleteError={autocompleteError}
                    setAutocompleteError={setAutocompleteError}
                  />
                </div>

                <div className="relative w-full">
                  <label htmlFor="client" className="block font-bold">
                    Cliente / Proveedor
                  </label>
                  <BiSolidCheckCircle
                    className={`absolute right-4 top-8 h-6 w-6 text-green-600 transition-opacity duration-200 ease-in-out ${
                      clientSupplier ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <input
                    id="client"
                    name="client"
                    value={clientSupplier}
                    className="w-full rounded-lg border border-gray-400 px-3 py-2"
                    disabled
                  />
                </div>

                <div className="flex gap-4">
                  {/* Document Type row */}
                  {documentOptions.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        value={option}
                        checked={selectedDocument === option}
                        onChange={(e) => setSelectedDocument(e.target.value)}
                        className="mr-2"
                      />
                      <label htmlFor="document">{option}</label>
                    </div>
                  ))}
                </div>
                {selectedDocument !== documentOptions[0] && (
                  <div className="w-full">
                    <label
                      htmlFor="documentNumber"
                      className="w-full font-bold"
                    >
                      Folio
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={documentNumber}
                      className="w-full rounded-lg border border-gray-400 px-3 py-2"
                      onChange={(e) => {
                        setDocumentNumber(e.target.value);
                        e.target.setCustomValidity("");
                      }}
                      required
                      pattern="[0-9]*"
                      autoComplete="off"
                      onInvalid={(e) =>
                        e.target.setCustomValidity(
                          "Debes ingresar un folio válido",
                        )
                      }
                    />
                  </div>
                )}
              </>
            )}
            {changedDataObject["operation"].value == ADJUSTMENT_OPERATION_ID &&
              changedDataObject["tank_number_to_date"].value != 0 && ( // equal zero means that the tank number was not adjusted in that event. Therefore, it cannot be corrected.
                <div className="flex flex-col items-center">
                  {/* tank number row */}
                  <label htmlFor="tankNumberInput" className="w-full font-bold">
                    Numeral
                  </label>
                  <div className="relative w-full">
                    <input
                      id="tankNumberInput"
                      className="w-full border p-3"
                      value={changedDataObject["tank_number_to_date"].value}
                      onChange={(e) =>
                        handleDataChanges("tank_number_to_date", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            <div className="w-full">
              <label htmlFor="notesArea" className="block">
                Notas
              </label>
              <textarea
                id="notesArea"
                name="notesArea"
                className="w-full rounded-lg border border-gray-400 px-3 py-2"
                rows="2"
                value={changedDataObject.notes.value}
                onChange={(e) => handleDataChanges("notes", e.target.value)}
              />
            </div>

            <hr className="divider" />
            <div className=" flex w-full justify-center gap-3">
              <button
                className="btn-error-small h-fit w-1/3 py-1"
                onClick={toggleModal}
              >
                Cancelar
              </button>
              <button
                className="btn-success-small h-fit w-1/3 py-1"
                type="submit"
              >
                Actualizar
              </button>
            </div>
            <div className="mt-2 w-full text-center font-bold text-red-500">
              {apiError}
            </div>
          </form>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <BiLoaderCircle className="animate-spin text-2xl" />
        </div>
      )}
    </div>
  );
};

export default EditEventModal;
