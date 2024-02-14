import React, { useContext, useState } from "react";
import { AppContext } from "../../App";
import tankService from "../../services/tank.service";
import { RxRulerHorizontal } from "react-icons/rx";

const MeasureStick = ({ triggerTank, toggleModal }) => {
  const { setTanks } = useContext(AppContext);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [apiError, setApiError] = useState("");

  const handleMeasure = (e) => {
    e.preventDefault();

    tankService
      .tankMeasurement(triggerTank.id, quantity, notes)
      .then((res) => {
        setTanks(res.data);
        toggleModal();
      })
      .catch((err) => {
        setApiError(err.message);
      });
  };

  return (
    <div className="text-center">
      <div className="mb-2 mt-5 text-2xl text-ocean-green-500">
        Medición de Estanque
      </div>
      <form onSubmit={handleMeasure} className="mt-5">
        <div className="mb-4">
          <input
            placeholder="Ingresa los litros"
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
            className="h-12 w-full rounded-lg border border-gray-400 px-3"
            required
            autoComplete="off"
            pattern="[0-9]*"
            onInvalid={(e) =>
              e.target.setCustomValidity("Debes ingresar una cantidad válida")
            }
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Notas adicionales"
            className="w-full rounded-lg border border-gray-400 p-2"
            rows={3}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <RxRulerHorizontal className="mx-auto h-20 w-20 text-ocean-green-500" />
        <div className="mb-4 text-3xl text-ocean-green-500">
          {quantity && parseInt(quantity).toLocaleString("es-CL")} Litros
        </div>
        <div>
          <button
            type="submit"
            className="btn-success rounded-lg px-6 py-2 font-bold text-white hover:bg-ocean-green-600"
          >
            Confirmar medición
          </button>
        </div>
        <div className="text-center text-red-600">{apiError}</div>
      </form>
    </div>
  );
};

export default MeasureStick;
