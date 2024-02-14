import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import tankService from "../../services/tank.service";
import { FaGasPump } from "react-icons/fa";
import { PiTruck } from "react-icons/pi";
import { BiLoaderCircle } from "react-icons/bi";

const CheckTankNumberModal = ({ tank, toggleModal }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [apiError, setApiError] = useState();
  const { setTanks } = useContext(AppContext);

  const getTankIcon = (tank) => {
    return tank && tank.type === "camion" ? (
      <PiTruck className="h-14 w-14" />
    ) : (
      <FaGasPump className="h-14 w-14" />
    );
  };

  const handleConfirmation = () => {
    tankService
      .checkTankNumber(tank.id, tank.current_quantity, tank.tank_number, notes)
      .then((res) => {
        setTanks(res.data);
        toggleModal();
      })
      .catch((err) =>
        setApiError(err.response?.data.message || "Error. No response"),
      );
  };

  useEffect(() => {
    if (tank) {
      setIsLoading(false);
    }
  }, [tank]);

  return (
    <div>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <BiLoaderCircle className="animate-spin text-2xl text-blue-500" />
        </div>
      ) : (
        <div className="relative flex w-full flex-col items-center overflow-hidden ">
          <div className="w-full overflow-auto border-4">
            <div className="border-b-4 border-r-4 capitalize">
              <div className="my-5 rounded bg-ocean-green-500 text-center font-bold text-white shadow">
                Revisión de Numeral
              </div>
              <div className=" flex h-40 items-center justify-center">
                <div className="flex h-28 w-28 flex-wrap content-center justify-center rounded-lg border-2 border-gray-600 bg-gray-200">
                  {getTankIcon(tank)}
                </div>
              </div>
              <div className="border-y-4 text-center text-sm">{tank.type}</div>
              <div className="flex items-center overflow-hidden break-words text-center text-lg">
                <span className="w-full font-bold">{tank.name}</span>
              </div>
            </div>
            <div className="col-span-2 border-b-4 p-5 text-center text-5xl">
              {tank.tank_number}
            </div>
            <div className="w-full text-center">Notas</div>
            <div className="col-span-2 border-b-4 text-center text-4xl">
              <textarea
                id="notesArea"
                name="notesArea"
                className="w-full rounded-lg border border-gray-400 px-3 py-2 text-base"
                rows="2"
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="col-span-2 flex justify-around gap-2 p-1">
              <button className="btn-error" onClick={() => toggleModal()}>
                Cancelar
              </button>
              <button className="btn-success" onClick={handleConfirmation}>
                Confirmar
              </button>
            </div>
          </div>
          {apiError !== "" && (
            <div className="mt-2 w-full text-center font-bold text-red-500">
              {apiError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckTankNumberModal;
