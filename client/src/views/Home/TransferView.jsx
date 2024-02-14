import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import ConfirmationView from "./ConfirmationView";
import tankService from "../../services/tank.service";

function TransferView({
  action,
  triggerTank,
  toggleModal,
  openModal,
  isConfirmationVisible,
  setIsConfirmationVisible,
}) {
  const { tanks, setTanks } = useContext(AppContext);
  const [selectedTankId, setSelectedTankId] = useState("");
  const [selectedTank, setSelectedTank] = useState("");
  const [quantity, setQuantity] = useState("");
  const [directTransfer, setDirectTransfer] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState(false);

  const [processingTransfer, setProcessingTransfer] = useState(false); // to prevent multiple calls to the api in the confirmation views
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    setSelectedTankId("");
    setQuantity("");
  }, [openModal]);

  useEffect(() => {
    if (
      (selectedTankId !== "" &&
        selectedTank &&
        selectedTank.id !== selectedTankId) ||
      (selectedTankId !== "" && selectedTank === "")
    ) {
      const tank = tanks.find((tank) => tank.id == selectedTankId);
      setSelectedTank(tank ? tank : "");
    }
  }, [selectedTankId, quantity]);

  const handleTransfer = (event) => {
    event.preventDefault();
    setIsConfirmationVisible(true);
  };

  const handleConfirmationTransfer = () => {
    setProcessingTransfer(true);
    tankService
      .transfer(
        action,
        triggerTank.id,
        selectedTankId,
        quantity,
        directTransfer,
        maxCapacity,
      )
      .then((res) => {
        setTanks(res.data);
        setTransferError("");
        toggleModal();
      })
      .catch((err) => {
        setTransferError(err.message);
        setProcessingTransfer(false);
      });
  };

  return (
    <div className="w-full">
      <div className=" w-full text-center text-2xl font-bold">
        Transferencia Interna
      </div>
      <div className=" w-full rounded bg-gray-200 text-center text-2xl font-thin">
        {action === "load"
          ? "Cargar " + triggerTank.name
          : "Descargar " + triggerTank.name}
      </div>
      {!isConfirmationVisible ? (
        <form onSubmit={handleTransfer} className="grid gap-5">
          <div>
            <select
              id="tank"
              name="tank"
              value={selectedTankId}
              onChange={(e) => {
                setSelectedTankId(e.target.value);
                e.target.setCustomValidity("");
              }}
              className="mt-10 h-12 w-full rounded-lg border border-gray-600 bg-gray-50"
              required
              onInvalid={(e) =>
                e.target.setCustomValidity("Debes seleccionar un estanque")
              }
            >
              <option value="">
                Seleccionar estanque {action === "load" ? "origen" : "destino"}
              </option>
              {tanks
                .filter((tank) => tank.id !== triggerTank.id)
                .map((tank) => (
                  <option key={tank.id} value={tank.id}>
                    {tank.name.toUpperCase()}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="text-gray-600">
              Cantidad a transferir
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
              className=" h-12 w-full rounded-lg border border-gray-600"
              required
              pattern="[0-9]*"
              autoComplete="off"
              onInvalid={(e) =>
                e.target.setCustomValidity("Debes ingresar una cantidad válida")
              }
            />
          </div>
          {((action == "unload" &&
            selectedTank &&
            selectedTank.type === "CAMION") ||
            (action == "load" && triggerTank.type === "CAMION")) && (
            <div className="flex">
              <input
                type="checkbox"
                value={directTransfer}
                onChange={() => setMaxCapacity(!maxCapacity)}
                className="form-checkbox focus:shadow-outline-red mr-1 h-4 w-4 self-center rounded border-gray-300 text-red-500 focus:outline-none"
              />
              <label htmlFor="directTranfer" className="font-bold text-red-500">
                Camión en capacidad máxima (
                {action == "unload"
                  ? parseInt(selectedTank.capacity).toLocaleString("es-CL")
                  : parseInt(triggerTank.capacity).toLocaleString("es-CL")}{" "}
                Lts)
              </label>
            </div>
          )}
          <div className="flex">
            <input
              type="checkbox"
              value={directTransfer}
              onChange={() => setDirectTransfer(!directTransfer)}
              className="form-checkbox focus:shadow-outline-red mr-1 h-4 w-4 self-center rounded border-gray-300 text-red-500 focus:outline-none"
            />
            <label htmlFor="directTranfer" className="font-bold text-red-500">
              Transferencia Directa (no modifica Numeral)
            </label>
          </div>

          <div className="mt-12 flex w-full justify-center">
            <button className="btn-success" type="submit">
              Transferir
            </button>
          </div>
        </form>
      ) : (
        <ConfirmationView
          setIsConfirmationVisible={setIsConfirmationVisible}
          action={action}
          triggerTank={triggerTank}
          quantity={quantity}
          selectedTank={selectedTank}
          handleConfirmation={handleConfirmationTransfer}
          processingTransfer={processingTransfer}
          transferError={transferError}
        />
      )}
    </div>
  );
}

export default TransferView;
