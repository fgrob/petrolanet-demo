import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import tankService from "../../services/tank.service";

const AddTankModal = ({
  toggleModal,
  typeOptions,
  tankGaugeOptions,
  setIsLoading,
}) => {
  const { setTanks } = useContext(AppContext);

  const [tankName, setTankName] = useState("");
  const [tankType, setTankType] = useState(typeOptions[0]);
  const [tankCapacity, setTankCapacity] = useState("");
  const [tankGauge, setTankGauge] = useState(tankGaugeOptions[1].value);
  const [tankNumber, setTankNumber] = useState("");

  const [apiError, setApiError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    tankService
      .createTank(tankName, tankType, tankCapacity, tankGauge, tankNumber)
      .then((res) => {
        setTanks(res.data);
        toggleModal();
        setIsLoading(true);
      })
      .catch((err) => {
        setApiError(err.message);
      });
  };

  const handleCancel = () => {
    toggleModal();
  };

  const handleKeyDown = (e) => {
    // Prevents unintentional closure of the modal when pressing Enter
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className="m-2 flex w-[400px] flex-wrap rounded p-2">
      <h1 className="h-fit w-full rounded-lg p-1 text-center text-2xl font-bold uppercase">
        Añadir Estanque
      </h1>
      <hr className="divider" />

      <form
        className="flex flex-1 flex-col gap-1"
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-1 text-center">
          {/* Name Row  */}
          <label htmlFor="tankName" className="mr-2 flex-1 text-end font-bold">
            Nombre
          </label>
          <div className="relative w-1/2">
            <input
              id="tankName"
              type="text"
              className="w-full border p-3"
              value={tankName}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setTankName(e.target.value);
                }
                e.target.setCustomValidity("");
              }}
              required
              autoComplete="off"
              onInvalid={(e) =>
                e.target.setCustomValidity(
                  "Debes ingresar un nombre para el estanque",
                )
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-center">
          {/* Type row */}
          <label htmlFor="tankType" className="mr-2 flex-1 text-end font-bold">
            Tipo
          </label>
          <div className="relative w-1/2">
            <select
              id="tankType"
              className="w-full border p-3"
              value={tankType}
              onChange={(e) => setTankType(e.target.value)}
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 text-center">
          {/* capacity Row  */}
          <label
            htmlFor="tankCapacity"
            className="mr-2 flex-1 text-end font-bold"
          >
            Capacidad
          </label>
          <div className="relative w-1/2">
            <input
              id="tankCapacity"
              type="text"
              inputMode="numeric"
              value={tankCapacity}
              className="w-full border p-3"
              onChange={(e) => {
                if (e.target.value <= 100000) {
                  setTankCapacity(e.target.value);
                }
                e.target.setCustomValidity("");
              }}
              required
              pattern="[0-9]*"
              autoComplete="off"
              onInvalid={(e) =>
                e.target.setCustomValidity(
                  "Debes ingresar una capacidad válida",
                )
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-1 text-center">
          {/* tank_gauge row */}
          <label htmlFor="tankGauge" className="mr-2 flex-1 text-end font-bold">
            Tiene medidor
          </label>
          <div className="relative w-1/2">
            <select
              id="tankGauge"
              className="w-full border p-3"
              value={tankGauge}
              onChange={(e) => {
                if (e.target.value === "true") {
                  setTankGauge(true);
                } else {
                  setTankGauge(false);
                  setTankNumber("");
                }
              }}
            >
              {tankGaugeOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {tankGauge && (
          <div className="flex items-center gap-1 text-center">
            {/* tank_number Row  */}
            <label
              htmlFor="tankNumber"
              className="mr-2 flex-1 text-end font-bold"
            >
              Numeral
            </label>
            <div className="relative w-1/2">
              <input
                id="tankNumber"
                type="text"
                inputMode="numeric"
                value={tankNumber}
                className="w-full border p-3"
                onChange={(e) => {
                  setTankNumber(e.target.value);
                  e.target.setCustomValidity("");
                }}
                pattern="[0-9]*"
                autoComplete="off"
                onInvalid={(e) =>
                  e.target.setCustomValidity("Debes ingresar un numeral válido")
                }
              />
            </div>
          </div>
        )}

        <hr className="divider" />
        <div className=" flex w-full justify-center gap-3">
          <button
            className="btn-error-small h-fit w-1/3 py-1"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button className="btn-success-small h-fit w-1/3 py-1" type="submit">
            Añadir
          </button>
        </div>
        <div className="text-center font-bold text-red-500">{apiError}</div>
      </form>
    </div>
  );
};

export default AddTankModal;
