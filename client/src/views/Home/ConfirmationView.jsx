import React from "react";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { FaGasPump } from "react-icons/fa";
import { PiTruck } from "react-icons/pi";
import { GiFactory } from "react-icons/gi";
import { GoPeople } from "react-icons/go";
import { BiLoaderCircle } from "react-icons/bi";

const ConfirmationView = ({
  setIsConfirmationVisible,
  action,
  triggerTank,
  quantity,
  selectedTank = null,
  clientSupplier = null,
  handleConfirmation,
  processingTransfer,
  transferError,
}) => {
  let originType;
  let originName;
  let originIcon;
  let destinationType;
  let destinationName;
  let destinationIcon;

  const getTankIcon = (tank) => {
    return tank && tank.type === "camion" ? (
      <PiTruck className="h-14 w-14" />
    ) : (
      <FaGasPump className="h-14 w-14" />
    );
  };

  if (clientSupplier) {
    if (action === "load") {
      originType = "Proveedor";
      originName = clientSupplier;
      originIcon = <GiFactory className="h-14 w-14" />;
      destinationType = triggerTank.type;
      destinationName = triggerTank.name;
      destinationIcon = getTankIcon(triggerTank);
    } else {
      originType = triggerTank.type;
      originName = triggerTank.name;
      originIcon = getTankIcon(triggerTank);
      destinationType = "Cliente";
      destinationName = clientSupplier;
      destinationIcon = <GoPeople className="h-14 w-14" />;
    }
  } else if (selectedTank) {
    if (action === "load") {
      originType = selectedTank.type;
      originName = selectedTank.name;
      originIcon = getTankIcon(selectedTank);
      destinationType = triggerTank.type;
      destinationName = triggerTank.name;
      destinationIcon = getTankIcon(triggerTank);
    } else if (action === "unload") {
      originType = triggerTank.type;
      originName = triggerTank.name;
      originIcon = getTankIcon(triggerTank);
      destinationType = selectedTank.type;
      destinationName = selectedTank.name;
      destinationIcon = getTankIcon(selectedTank);
    }
  }

  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden ">
      <div className="grid w-full grid-cols-2 border-4 ">
        <div className="border-b-4 border-r-4 capitalize">
          <div className="my-5 rounded bg-red-500 text-center text-white shadow">
            Origen
          </div>
          <div className=" flex h-40 items-center justify-center">
            <div className="flex h-28 w-28 flex-wrap content-center justify-center rounded-lg border-2 border-gray-600 bg-gray-200">
              {originIcon}
            </div>
            <div className="absolute right-0 top-28 flex w-full justify-center">
              <MdOutlineKeyboardDoubleArrowRight className="animate h-full w-14 " />
            </div>
          </div>
          <div className="border-y-4 text-center text-sm">{originType}</div>
          <div className="flex h-20 items-center overflow-hidden break-words text-center text-lg">
            <span className="w-full">{originName}</span>
          </div>
        </div>
        <div className="border-b-4 capitalize">
          <div className="my-5 rounded bg-ocean-green-500 text-center text-white shadow">
            Destino
          </div>
          <div className="flex h-40 items-center justify-center">
            <div className="flex h-28 w-28 flex-wrap content-center justify-center rounded-lg border-2 border-gray-600 bg-gray-200">
              {destinationIcon}
            </div>
          </div>
          <div className="border-y-4 text-center text-sm">
            {destinationType}
          </div>
          <div className="flex h-20 items-center overflow-hidden break-words text-center text-lg">
            <span className="w-full">{destinationName}</span>
          </div>
        </div>
        <div className="col-span-2 border-b-4 p-5 text-center text-4xl">
          {parseInt(quantity).toLocaleString("es-CL")} Lts
        </div>
        <div className="col-span-2 flex justify-around p-1">
          <button
            className="btn-error"
            onClick={() => setIsConfirmationVisible(false)}
          >
            Cancelar
          </button>
          <button
            className="btn-success relative"
            onClick={handleConfirmation}
            disabled={processingTransfer}
          >
            Confirmar
            {processingTransfer && (
              <span>
                <BiLoaderCircle className="absolute right-2 top-3 h-5 w-5 animate-spin" />
              </span>
            )}
          </button>
        </div>
      </div>
      {transferError !== "" && (
        <div className="mt-2 w-full text-center font-bold text-red-500">
          {transferError}
        </div>
      )}
    </div>
  );
};

export default ConfirmationView;
