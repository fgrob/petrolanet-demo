import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { BiLoaderCircle } from "react-icons/bi";

const TotalsBox = ({
  totalsCalculationComplete,
  setTotalsCalculationComplete,
  filteredEventLogs,
  selectedClientSupplier,
  selectedUser,
  selectedOperation,
  startDate,
  endDate,
  selectedTankType,
  selectedTank,
  selectedDocumentType,
  documentNumber,
}) => {
  const { tanks } = useContext(AppContext);

  const [totalUnloads, setTotalUnloads] = useState(0);
  const [totalLoads, setTotalLoads] = useState(0);
  const [suppliers, setSuppliers] = useState({});

  const [hideUnloads, setHideUnloads] = useState(false);
  const [hideLoads, setHideLoads] = useState(false);

  const appliedFilters = [
    // (client/supplier, date and documentNumber are treated differently)
    { label: "Usuario", value: selectedUser },
    { label: "Operación", value: selectedOperation },
    { label: "Tipo Estanque", value: selectedTankType },
    { label: "Estanque", value: selectedTank },
    { label: "Tipo documento", value: selectedDocumentType },
  ];

  const findTankType = () => {
    //this is for setting the TankType if it is not set when there is a selected Tank
    const tank = tanks.find((tank) => tank.name === selectedTank);
    return tank.type;
  };

  const hidingLogic = () => {
    // Determines which elements to hide in the TotalsBox based on selected filters
    let tankType = selectedTankType;

    if (selectedTank !== "TODOS" && selectedTankType === "TODOS") {
      tankType = findTankType();
    }
    if (
      tankType === "ESTANQUE MOVIL" ||
      tankType === "CAMION" ||
      selectedOperation === "VENTA" ||
      selectedOperation === "MEDICION"
    ) {
      setHideLoads(true);
    }
    if (selectedOperation === "COMPRA" || selectedOperation === "MEDICION") {
      setHideUnloads(true);
    }
  };

  const calcTotals = () => {
    const totalLoads = filteredEventLogs.reduce((total, eventLog) => {
      if (eventLog.operation.id === 1) {
        // id:1 => "COMPRA"
        return total + eventLog.transaction_quantity;
      }
      return total;
    }, 0);

    const totalUnloads = filteredEventLogs.reduce((total, eventLog) => {
      if (eventLog.operation.id === 2) {
        // id:2 => "VENTA"
        return total + Math.abs(eventLog.transaction_quantity);
      }
      return total;
    }, 0);

    const supplierMap = {};

    filteredEventLogs.forEach((eventLog) => {
      if (eventLog.supplier && eventLog.operation.id === 1) {
        const supplier = eventLog.supplier.business_name;

        const transaction_quantity = parseInt(eventLog.transaction_quantity);
        supplierMap[supplier] =
          (supplierMap[supplier] || 0) + transaction_quantity;
      }

      setSuppliers(supplierMap);
    });

    if (totalLoads === 0) {
      setHideLoads(true);
    }

    if (totalUnloads === 0) {
      setHideUnloads(true);
    }

    if (Object.keys(supplierMap).length < 2) {
      // if there is only one supplier, do not display the list of suppliers under 'Compras'
      setSuppliers({});
    }

    setTotalLoads(totalLoads);
    setTotalUnloads(totalUnloads);

    setTimeout(() => {
      // little delay for the load spin in the totals button
      setTotalsCalculationComplete(true);
    }, 200);
  };

  useEffect(() => {
    hidingLogic();
    calcTotals();

    return () => {
      setTotalsCalculationComplete(false);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed left-20 z-30 flex w-full flex-wrap overflow-hidden ${
        totalsCalculationComplete ? "h-full" : "h-10"
      } transition-height duration-300 ease-in-out`}
    >
      <div
        id="totalsElement" // for the handleClickOutsideTotals in the parent component
        className="pointer-events-auto absolute top-10 flex h-auto flex-col gap-2 overflow-auto rounded-xl border-2 border-ocean-green-900 bg-ocean-green-200 py-4 text-center shadow-2xl landscape:h-64 landscape:overflow-scroll lg:landscape:h-auto landscape:lg:overflow-auto"
      >
        <div className="flex transform flex-col gap-2 transition-transform duration-300 ease-in-out">
          {totalsCalculationComplete ? (
            <div className="text-3xl font-bold">Totales</div>
          ) : (
            <div className="flex justify-center border border-black">
              <BiLoaderCircle className="h-7 w-7 animate-spin border border-purple-500 text-center text-blue-500" />
            </div>
          )}

          {!hideUnloads && (
            <div className="flex items-center justify-between px-4 text-2xl">
              <span className="rounded bg-green-400 px-2 py-1 font-semibold">
                Ventas:
              </span>
              <span className="w-32">
                {totalUnloads.toLocaleString("es-CL")} Lts
              </span>
            </div>
          )}

          {/* Loads section */}
          {!hideLoads && (
            <>
              <div className="flex items-center justify-between px-4 text-2xl">
                <span className="rounded bg-red-400 px-2 py-1 font-semibold">
                  Compras:
                </span>
                <span className="w-32">
                  {totalLoads.toLocaleString("es-CL")} Lts
                </span>
              </div>
              <ul>
                {Object.entries(suppliers).map(
                  ([supplierName, supplierTotal]) => {
                    return (
                      <li key={supplierName}>
                        <div className="flex flex-wrap justify-center text-sm">
                          <div className="w-full">{supplierName}</div>
                          <div className="rounded bg-red-400 px-2 py-1 font-bold">
                            {supplierTotal.toLocaleString("es-CL")} Lts
                          </div>
                          <div className="mt-1 w-full border-b-2"></div>
                        </div>
                      </li>
                    );
                  },
                )}
              </ul>
            </>
          )}
          {hideLoads && hideUnloads && (
            <div className="bg-red-500 p-3 text-white">
              No hay totales para mostrar
            </div>
          )}
        </div>
        <div className="bg-blue-950 text-lg font-bold text-white">
          Filtros aplicados:
        </div>
        <ul className="flex flex-col gap-1 px-4 text-xs">
          <li className="rounded-md bg-orange-300 font-bold">
            {selectedClientSupplier}
          </li>
          <li>
            De{" "}
            {startDate && (
              <span className="font-bold">
                {startDate.format("DD-MM-YYYY")}
              </span>
            )}{" "}
            a{" "}
            {endDate && (
              <span className="font-bold">{endDate.format("DD-MM-YYYY")}</span>
            )}
          </li>
          {appliedFilters.map(
            (filter) =>
              filter.value !== "TODOS" && (
                <li key={filter.value}>
                  <span className="font-bold">{filter.label}: </span>
                  <span className="rounded border border-black bg-blue-950 px-1 font-bold text-white shadow">
                    {filter.value}
                  </span>
                </li>
              ),
          )}
          {documentNumber && (
            <li>
              <span className="font-bold">Folio: </span>
              <span className="font-bold text-red-500">{documentNumber}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TotalsBox;
