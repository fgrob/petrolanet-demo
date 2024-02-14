import React from "react";
import { PiArrowSquareOutDuotone } from "react-icons/pi";
import { PiArrowSquareInDuotone } from "react-icons/pi";
import { PiArrowsCounterClockwiseFill } from "react-icons/pi";

const SelectorView = ({ action, modalViewOptions, setModalView }) => {
  return (
    <div className="flex flex-col flex-wrap items-center justify-evenly gap-5 md:flex-row md:content-center">
      <div className="relative w-full text-center text-2xl font-bold">
        Tipo de {action === "load" ? "Carga" : "Descarga"}
        <div className="divider" />
      </div>
      <div>
        <button
          type="button"
          className="relative rounded-lg border-2 border-gray-500 p-10 shadow-md hover:opacity-50"
          onClick={() => {
            setModalView(modalViewOptions.TRANSFER);
          }}
        >
          <PiArrowsCounterClockwiseFill className="h-28 w-28 text-gray-600 md:h-14 md:w-14" />
          <div className="absolute bottom-1 right-0 w-full font-bold text-gray-600">
            Traspaso interno
          </div>
        </button>
      </div>
      <div>
        <button
          type="button"
          className="relative rounded-lg border-2 border-gray-600 p-10 shadow-md hover:opacity-50"
          onClick={() =>
            setModalView(
              action === "load"
                ? modalViewOptions.REFILL
                : modalViewOptions.SALE,
            )
          }
        >
          {action === "load" ? (
            <>
              <PiArrowSquareInDuotone className="h-28 w-28 text-gray-600 md:h-14 md:w-14" />
              <div className="absolute bottom-1 right-0 w-full text-gray-600">
                Proveedor
              </div>
            </>
          ) : (
            <>
              <PiArrowSquareOutDuotone className="h-28 w-28 text-gray-600 md:h-14 md:w-14" />
              <div className="absolute bottom-1 right-0 w-full text-gray-600">
                Cliente
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SelectorView;
