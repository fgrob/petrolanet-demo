import React, { useState } from "react";
import clientService from "../../services/client.service";
import supplierService from "../../services/supplier.service";

const CreateAndEditModal = ({
  toggleModal,
  target,
  setClientSupplierList,
  editMode,
  idToEdit,
  clientSupplierList,
  rut,
  setRut,
  businessName,
  setBusinessName,
  alias,
  setAlias,
}) => {
  const [apiError, setApiError] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleRutChange = (e) => {
    e.target.setCustomValidity("");

    const formatRut = (inputRut) => {
      const cleanRut = inputRut.replace(/[^0-9kK]/g, "").replace(/k/g, "K"); // first regex: allows numbers and the letter K . Second regex: Uppercases the letter 'K'.

      if (cleanRut.length > 1) {
        const body = cleanRut.slice(0, -1);
        const verifierDigit = cleanRut.slice(-1);
        const formattedRut = body + "-" + verifierDigit;
        return formattedRut;
      } else {
        return cleanRut;
      }
    };
    const inputRut = e.target.value;
    const formattedRut = formatRut(inputRut);
    setRut(formattedRut);
  };

  const handleNameChange = (e) => {
    const formatName = (name) => {
      return name.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
    };

    const formattedName = formatName(e.target.value);
    if (e.target.id === "businessNameInput") {
      setBusinessName(formattedName);
    } else if (e.target.id === "aliasInput") {
      setAlias(formattedName);
    }
  };

  const isRutValid = () => {
    const rutInput = document.getElementById("rutInput");

    const validLength = () => {
      if (!rut || rut.length < 9) {
        rutInput.setCustomValidity("Debes ingresar un RUT válido");
        rutInput.reportValidity();
        return false;
      }
      return true;
    };

    const rutExist = () => {
      const matchFound = clientSupplierList.some((clientSupplier) => {
        if (editMode && clientSupplier.id === idToEdit) {
          // This is to exclude the current client/supplier from the check (otherwise it will return true)
          return false;
        }
        return clientSupplier.rut === rut;
      });

      if (matchFound) {
        rutInput.setCustomValidity("El RUT ingresado ya existe");
        rutInput.reportValidity();
      }
      return matchFound;
    };

    return validLength() && !rutExist();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const handleSubmitCreation = () => {
      if (target === "clients") {
        clientService
          .createClient(rut, businessName, alias)
          .then((res) => {
            setClientSupplierList(res.data);
            toggleModal();
          })
          .catch((err) => setApiError(err.message));
      } else if (target === "suppliers") {
        supplierService
          .createSupplier(rut, businessName, alias)
          .then((res) => {
            setClientSupplierList(res.data);
            toggleModal();
          })
          .catch((err) => setApiError(err.message));
      }
    };

    const handleSubmitEdition = () => {
      if (target === "clients") {
        clientService
          .editClient(idToEdit, rut, businessName, alias)
          .then((res) => {
            setClientSupplierList(res.data);
            toggleModal();
          })
          .catch((err) => setApiError(err.message));
      } else if (target === "suppliers") {
        supplierService
          .editSupplier(idToEdit, rut, businessName, alias)
          .then((res) => {
            setClientSupplierList(res.data);
            toggleModal();
          })
          .catch((err) => setApiError(err.message));
      }
    };

    if (!isRutValid()) {
      return;
    }
    if (!editMode) {
      handleSubmitCreation();
    } else {
      handleSubmitEdition();
    }
  };

  return (
    <div className="w-full overflow-auto rounded-lg bg-white p-2">
      <div className="mb-3 text-center text-2xl font-bold">
        {!editMode ? "Añadir " : "Editar "}
        {target === "clients" ? "Cliente" : "Proveedor"}
      </div>
      <form
        className="flex flex-wrap justify-center space-y-2 text-gray-600"
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
      >
        <div className="w-1/3">
          <label htmlFor="rutInput" className="block font-bold text-gray-600">
            RUT
          </label>
          <input
            type="text"
            id="rutInput"
            name="rutInput"
            value={rut}
            onChange={handleRutChange}
            className="w-full rounded-lg border border-gray-400 px-3 py-2"
            autoComplete="off"
            maxLength={10}
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="businessNameInput"
            className="block font-bold text-gray-600"
          >
            RAZÓN SOCIAL
          </label>
          <input
            type="text"
            id="businessNameInput"
            name="businessNameInput"
            value={businessName}
            onChange={(e) => {
              handleNameChange(e);
              e.target.setCustomValidity("");
            }}
            className="lg:w- w-full rounded-lg border border-gray-400 px-3 py-2"
            required
            autoComplete="off"
            maxLength={65}
            onInvalid={(e) =>
              e.target.setCustomValidity("Debes ingresar una Razón Social")
            }
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="businessNameInput"
            className="block font-bold text-gray-600"
          >
            ALIAS
          </label>
          <input
            type="text"
            id="aliasInput"
            name="aliasInput"
            value={alias}
            onChange={handleNameChange}
            className="lg:w- w-full rounded-lg border border-gray-400 px-3 py-2"
            autoComplete="off"
            maxLength={30}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <button className="btn-success" type="submit">
            Confirmar
          </button>
        </div>
      </form>
      <div className="text-center font-bold text-red-500">{apiError}</div>
    </div>
  );
};

export default CreateAndEditModal;
