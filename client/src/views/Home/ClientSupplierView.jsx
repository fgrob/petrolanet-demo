// TRADUCIDO

import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import tankService from "../../services/tank.service";
import clientService from "../../services/client.service";
import supplierService from "../../services/supplier.service";
import Autocomplete from "../../components/Autocomplete";
import ConfirmationView from "./ConfirmationView";
import { BiSolidCheckCircle } from "react-icons/bi";
import { BiLoaderCircle } from "react-icons/bi";
import { documentOptions } from "../../utils/constants";

const ClientSupplierView = ({
  action,
  triggerTank,
  toggleModal,
  isConfirmationVisible,
  setIsConfirmationVisible,
}) => {
  const { setTanks } = useContext(AppContext);
  const [clientSupplierList, setClientSupplierList] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [clientSupplierId, setClientSupplierId] = useState("");
  const [rut, setRut] = useState("");
  const [clientSupplier, setClientSupplier] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [autocompleteError, setAutocompleteError] = useState("");

  const [apiError, setApiError] = useState("");
  const [processingTransfer, setProcessingTransfer] = useState(false);

  useEffect(() => {
    setClientSupplierId("");
    setRut("");
    setClientSupplier("");
    setSelectedDocument(documentOptions[0]);
    setDocumentNumber("");
    setQuantity("");
    setNotes("");

    setErrorMessage("");
    setAutocompleteError("");
    setApiError("");

    setIsLoading(true);

    action === "load"
      ? supplierService
          .getSuppliers("inputs")
          .then((res) => {
            setClientSupplierList(res.data);
          })
          .catch((err) => {
            setApiError(err.message);
          })
          .finally(() => {
            setIsLoading(false);
          })
      : clientService
          .getClients("inputs")
          .then((res) => {
            setClientSupplierList(res.data);
          })
          .catch((err) => {
            setApiError(err.message);
          })
          .finally(() => {
            setIsLoading(false);
          });
  }, []);

  useEffect(() => {
    selectedDocument === documentOptions[0] && setDocumentNumber("");
  }, [selectedDocument]);

  useEffect(() => {
    // set's and id for the selected client
    if (clientSupplier !== "") {
      const client = clientSupplierList.find((client) => client.rut === rut);
      setClientSupplierId(client.id);
    }
  }, [clientSupplier]);

  const handleSellOrSupply = (e) => {
    e.preventDefault();

    if (clientSupplier === "") {
      setAutocompleteError("You must selected a valid option");
      return;
    }

    setIsConfirmationVisible(true);
  };

  const handleConfirmationSellOrSupply = () => {
    setProcessingTransfer(true);
    tankService
      .sellOrSupply(
        action,
        triggerTank.id,
        clientSupplierId,
        selectedDocument,
        documentNumber,
        quantity,
        notes,
      )
      .then((res) => {
        setTanks(res.data);
        toggleModal();
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setProcessingTransfer(false);
      });
  };

  return (
    <div className="w-full overflow-auto rounded-lg bg-white p-2">
      <div className="text-center text-2xl">
        {action === "load" ? "Fuel Refill" : "Client Sale"}
      </div>
      {!isConfirmationVisible ? (
        isLoading ? (
          <div className="flex h-2/3 items-center justify-center">
            <BiLoaderCircle className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <form
            className="space-y-2 text-gray-600"
            onSubmit={handleSellOrSupply}
          >
            {clientSupplierList && clientSupplierList.length > 0 && (
              <div className="w-full">
                <label htmlFor="rut" className="block">
                  RUT
                </label>
                <Autocomplete
                  inputValue={rut}
                  setInputValue={setRut}
                  setClientSupplier={setClientSupplier}
                  suggestions={clientSupplierList.map((client) => ({
                    value: client.rut,
                    label: client.business_name,
                  }))}
                  autocompleteError={autocompleteError}
                  setAutocompleteError={setAutocompleteError}
                />
              </div>
            )}
            <div className="relative w-full">
              <label htmlFor="client" className="block">
                {action === "load" ? "Supplier" : "Client"}
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
                <label htmlFor="documentNumber" className="block">
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
                    e.target.setCustomValidity("You must enter a valid document number.")
                  }
                />
              </div>
            )}

            <div className="w-full">
              <label htmlFor="quantity" className="block text-gray-600">
                Cantidad
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={(e) => {
                  if (e.target.value <= 100000) {
                    setQuantity(e.target.value);
                  }
                  e.target.setCustomValidity("");
                }}
                className="w-full rounded-lg border border-gray-400 px-3 py-2"
                required
                pattern="[0-9]*"
                autoComplete="off"
                onInvalid={(e) =>
                  e.target.setCustomValidity("You must enter a valid quantity.")
                }
              />
            </div>

            <div className="w-full">
              <label htmlFor="notesArea" className="block">
                Notas
              </label>
              <textarea
                id="notesArea"
                name="notesArea"
                className="w-full rounded-lg border border-gray-400 px-3 py-2"
                rows="2"
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-center">
              <button className="btn-success" type="submit">
                Transferir
              </button>
            </div>
            <div className="text-center text-red-600">{errorMessage}</div>
          </form>
        )
      ) : (
        <ConfirmationView
          setIsConfirmationVisible={setIsConfirmationVisible}
          action={action}
          triggerTank={triggerTank}
          quantity={quantity}
          clientSupplier={clientSupplier}
          handleConfirmation={handleConfirmationSellOrSupply}
          processingTransfer={processingTransfer}
          transferError={apiError}
        />
      )}
    </div>
  );
};

export default ClientSupplierView;
