import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import tankService from "../../services/tank.service";

const ConfirmationModal = ({
  selectedTankIdentifiers,
  selectedTankData,
  toggleModal,
}) => {
  const { setTanks } = useContext(AppContext);
  const [processingAdjustment, setProcessingAdjustment] = useState(false);
  const [apiError, setApiError] = useState("");

  const [notes, setNotes] = useState();

  const keyLabels = {
    type: "Tipo",
    capacity: "Capacidad",
    current_quantity: "Saldo",
    tank_gauge: "Medidor",
    tank_number: "Numeral",
  };

  const formattedData = (key, value) => {
    if (typeof value === "string") {
      const parsedValue = parseInt(value);
      return isNaN(parsedValue) ? value : parsedValue.toLocaleString("es-CL");
    } else if (typeof value === "number") {
      return key !== "tank_number" ? value.toLocaleString("es-CL") : value;
    } else if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    } else {
      return value;
    }
  };

  const setUpdatedData = () => {
    const tankId = selectedTankIdentifiers.id;
    const changedData = {};

    for (const [key, value] of Object.entries(selectedTankData)) {
      if (value.originalValue != value.updatedValue) {
        changedData[key] = value.updatedValue;
      }
    }
    setProcessingAdjustment(true);
    tankService
      .adjustment(tankId, changedData, notes)
      .then((res) => {
        setTanks(res.data);
        toggleModal();
      })
      .catch((err) => {
        setApiError(err.message);
      })
      .finally(() => {
        setProcessingAdjustment(false);
      });
  };

  return (
    <div className="overflow-x-auto">
      <h1
        className={`h-fit w-full rounded-lg p-1 text-center text-2xl font-bold uppercase`}
      >
        {selectedTankIdentifiers.name}
      </h1>
      <table className="min-w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="border-b px-6 py-3 text-left font-semibold"></th>
            <th className="border-b px-6 py-3 text-left font-semibold">
              Original
            </th>
            <th className="border-b px-6 py-3 text-left font-semibold">
              Cambios
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(selectedTankData).map(([key, value]) => (
            <tr
              key={key}
              className="transition-all duration-300 hover:bg-gray-100"
            >
              <td className="border-b px-6 py-2">{keyLabels[key]}</td>
              <td className="border-b px-6 py-2">
                {value.originalValue != value.updatedValue ? (
                  <span className="font-bold text-red-700">
                    {formattedData(key, value.originalValue)}
                  </span>
                ) : (
                  <span> {formattedData(key, value.originalValue)}</span>
                )}
              </td>
              <td className="border-b px-6 py-2">
                {value.originalValue != value.updatedValue && (
                  <span className="font-bold text-ocean-green-700">
                    {formattedData(key, value.updatedValue)}
                  </span>
                )}
              </td>
            </tr>
          ))}
          <tr className="transition-all duration-300 hover:bg-gray-100">
            <td
              className="border-b px-6 py-2 text-center font-bold"
              colSpan="3"
            >
              <label htmlFor="NoteArea">Notas</label>
            </td>
          </tr>

          <tr className="transition-all duration-300 hover:bg-gray-100">
            <td className="border-b px-6 py-2" colSpan="3">
              <textarea
                id="NoteArea"
                className="focus:shadow-outline-blue block w-full resize-none rounded border border-gray-500 bg-gray-50 px-4 py-2 leading-5 text-gray-600 transition duration-300 ease-in-out focus:border-gray-600 focus:outline-none"
                rows="3"
                placeholder="Escribe aquí..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-3 flex w-full justify-center gap-3">
        <button
          className="btn-error-small h-fit w-1/3 py-1"
          onClick={toggleModal}
        >
          Cancelar
        </button>
        <button
          className="btn-success-small h-fit w-1/3 py-1"
          onClick={setUpdatedData}
          disabled={processingAdjustment}
        >
          Confirmar
        </button>
      </div>

      <div className="text-center font-bold text-red-500">{apiError}</div>
    </div>
  );
};

export default ConfirmationModal;
