import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Autocomplete from "../../components/Autocomplete";
import TotalsBox from "./TotalsBox";
import moment from "moment-timezone";
import { BiSolidCheckCircle } from "react-icons/bi";
import { IoHomeSharp } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { PiProjectorScreenChartDuotone } from "react-icons/pi";
import { BiLoaderCircle } from "react-icons/bi";
import { LuRefreshCw } from "react-icons/lu";

const ALL_VALUES = "TODOS";

const FiltersBar = ({
  filters,
  setFilters,
  clientSupplierList,
  eventLogs,
  generateFilteredEventLogs,
  filteredEventLogs,
  fetchEventLogs,
  setIsTableReloading,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const [openFiltersBar, setOpenFiltersBar] = useState(false);
  const [isAnyFilterApplied, setIsAnyFilterApplied] = useState(false);

  const [rut, setRut] = useState("");
  const prevRut = useRef(rut);
  const [selectedClientSupplier, setSelectedClientSupplier] = useState("");
  const [clientSupplierInputError, setClientSupplierInputError] = useState("");

  const [selectedUser, setSelectedUser] = useState(ALL_VALUES);
  const prevSelectedUser = useRef(selectedUser);
  const [selectedOperation, setSelectedOperation] = useState(ALL_VALUES);
  const prevSelectedOperation = useRef(selectedOperation);

  const [selectedTankType, setSelectedTankType] = useState(ALL_VALUES);
  const prevSelectedTankType = useRef(selectedTankType);
  const [selectedTank, setSelectedTank] = useState(ALL_VALUES);
  const prevSelectedTank = useRef(selectedTank);

  const [selectedDocumentType, setSelectedDocumentType] = useState(ALL_VALUES);
  const prevSelectedDocumentType = useRef(selectedDocumentType);
  const [documentNumber, setDocumentNumber] = useState("");
  const prevDocumentNumber = useRef(documentNumber);

  const [openTotals, setOpenTotals] = useState(false);
  const [totalsCalculationComplete, setTotalsCalculationComplete] =
    useState(false);

  const handleFilterSelector = (filterType, selectedValue) => {
    const newFilters = { ...filters };

    for (const option in newFilters[filterType]) {
      if (filterType === "clientSupplierFilters") {
        selectedValue
          ? (newFilters["clientSupplierFilters"][option] =
              selectedValue === option) // only the matching value is true
          : (newFilters["clientSupplierFilters"][option] = true); // if no client/supplier is assigned, then all values are true
      } else if (filterType === "documentNumberFilters") {
        if (option.includes(selectedValue)) {
          newFilters["documentNumberFilters"][option] = true;
        } else {
          newFilters["documentNumberFilters"][option] = false;
        }
      } else {
        newFilters[filterType][option] =
          selectedValue === ALL_VALUES || selectedValue === option; // when TODOS is selected, it sets all options to 'true'
      }
    }
    setFilters(newFilters);
  };

  const handleDateFilter = () => {
    if (!startDate) {
      defaultDate(true, false); // setDefaultStartDate, setDefaultEndDate
    }

    if (!endDate) {
      defaultDate(false, true);
    }

    setIsTableReloading(true);
    fetchEventLogs(startDate, endDate);

    // fetchEventLogs will create a new filters list (and client/supplier list) based on the response data.
    // The response data will not have filters applied
    clearFiltersWithoutEffect();
  };

  const resetClientSupplierFilter = () => {
    setSelectedClientSupplier("");
    setRut("");
  };

  const resetDocumentNumberFilter = () => {
    setDocumentNumber("");
  };

  const resetFilters = () => {
    //this does not include the Date filter

    const newFilters = { ...filters };
    for (const key in newFilters) {
      for (const subKey in newFilters[key]) {
        newFilters[key][subKey] = true;
      }
    }
    setFilters(newFilters);
    clearFiltersWithoutEffect();
  };

  const resetDateAndFilters = () => {
    defaultDate();
    setIsTableReloading(true);
    fetchEventLogs();
    clearFiltersWithoutEffect();
  };

  const clearFiltersWithoutEffect = () => {
    // this is to clear the selectors and inputs without triggering each handleFilter
    // this does not include the Date filter
    prevRut.current = "";
    prevSelectedUser.current = ALL_VALUES;
    prevSelectedOperation.current = ALL_VALUES;
    prevSelectedTankType.current = ALL_VALUES;
    prevSelectedTank.current = ALL_VALUES;
    prevSelectedDocumentType.current = ALL_VALUES;
    prevDocumentNumber.current = "";
    setRut("");
    setSelectedClientSupplier("");
    setSelectedUser(ALL_VALUES);
    setSelectedOperation(ALL_VALUES);
    setSelectedTankType(ALL_VALUES);
    setSelectedTank(ALL_VALUES);
    setSelectedDocumentType(ALL_VALUES);
    setDocumentNumber("");

    setIsAnyFilterApplied(false);
  };

  const checkActiveFilters = () => {
    //for knowing if there is any filter active
    // this does not include the Date filter

    if (
      rut !== "" ||
      selectedUser !== ALL_VALUES ||
      selectedOperation !== ALL_VALUES ||
      selectedTankType !== ALL_VALUES ||
      selectedTank !== ALL_VALUES ||
      documentNumber !== ""
    ) {
      setIsAnyFilterApplied(true);
    } else {
      setIsAnyFilterApplied(false);
    }
  };

  const defaultDate = (
    setDefaultStartDate = true,
    setDefaultEndDate = true,
  ) => {
    //this function sets a default date for the startDate or endDate or both if necessary
    // default startDate: today
    // default endDate: today

    if (setDefaultStartDate) {
      const date = moment.tz("America/Santiago").startOf("day");
      setStartDate(date);
    }

    if (setDefaultEndDate) {
      const date = moment.tz("America/Santiago").endOf("day");
      setEndDate(date);
    }
  };

  const handleRefreshButton = () => {
    setIsAnyFilterApplied(false);
    clearFiltersWithoutEffect();
    resetDateAndFilters();
    fetchEventLogs();
  };

  useEffect(() => {
    // set's the table data
    generateFilteredEventLogs(eventLogs);
  }, [filters]);

  useEffect(() => {
    // set's the dates in the inputs
    defaultDate();
  }, []);

  useEffect(() => {
    //Handles changes in the filters

    // track which state changed and go for it. This 'prev' technique also helps prevent the initial useEffect execution
    if (prevRut.current !== rut) {
      handleFilterSelector("clientSupplierFilters", selectedClientSupplier);
      prevRut.current = rut;
    }

    if (prevSelectedUser.current !== selectedUser) {
      handleFilterSelector("userFilters", selectedUser);
      prevSelectedUser.current = selectedUser;
    }

    if (prevSelectedOperation.current !== selectedOperation) {
      handleFilterSelector("operationFilters", selectedOperation);
      prevSelectedOperation.current = selectedOperation;
    }

    if (prevSelectedTankType.current !== selectedTankType) {
      handleFilterSelector("tankTypeFilters", selectedTankType);
      prevSelectedTankType.current = selectedTankType;
    }

    if (prevSelectedTank.current !== selectedTank) {
      handleFilterSelector("tankFilters", selectedTank);
      prevSelectedTank.current = selectedTank;
    }

    if (prevSelectedDocumentType.current !== selectedDocumentType) {
      handleFilterSelector("documentTypeFilters", selectedDocumentType);
      prevSelectedDocumentType.current = selectedDocumentType;
    }

    if (prevDocumentNumber.current !== documentNumber) {
      handleFilterSelector("documentNumberFilters", documentNumber);
      prevDocumentNumber.current = documentNumber;
    }

    checkActiveFilters();
  }, [
    selectedClientSupplier,
    selectedUser,
    selectedOperation,
    selectedTankType,
    selectedTank,
    selectedDocumentType,
    documentNumber,
  ]);

  useEffect(() => {
    const handleClickOutsideFiltersBar = (e) => {
      const filtersBarElement = document.getElementById("filtersBar");
      if (!filtersBarElement.contains(e.target) && openFiltersBar) {
        filtersBarElement.scrollTo(0, 0); // horizontal screen on mobiles can have scrolling. And when the filter bar is hidden, it may be mispositioned
        setOpenFiltersBar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideFiltersBar);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFiltersBar);
    };
  }, [openFiltersBar]);

  useEffect(() => {
    const handleClickOutsideTotals = (e) => {
      const totalsElement = document.getElementById("totalsElement");
      const totalButton = document.getElementById("totalsButton"); // To prevent double execution of setOpenTotals

      if (
        !totalsElement.contains(e.target) &&
        !totalButton.contains(e.target)
      ) {
        setOpenTotals(false);
      }
    };
    if (openTotals) {
      document.addEventListener("mousedown", handleClickOutsideTotals);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideTotals);
    };
  }, [openTotals]);

  return (
    <div
      id="filtersBar"
      className={`${
        openFiltersBar
          ? "h-5/6 overflow-auto md:h-3/5 lg:overflow-hidden"
          : "h-11 overflow-hidden"
      } border bg-gray-50 transition-all duration-300`}
    >
      <div className="flex items-center">
        <div className="mr-2 flex flex-1 md:gap-4">
          <div className="mr-3 flex gap-1">
            <Link
              to="/"
              className=" flex rounded border border-gray-500 px-1 text-gray-500 shadow hover:text-gray-900 lg:mr-0"
            >
              <div className="h-full w-7">
                <IoHomeSharp className="h-full w-full" />
              </div>
            </Link>
            <div className="mr-11 hidden rounded border border-gray-500 px-1 text-gray-500 shadow hover:text-gray-900 lg:mr-0 lg:flex">
              <button onClick={handleRefreshButton}>
                <LuRefreshCw className="h-7 w-7" />
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              id="totalsButton"
              className="relative flex items-center rounded border border-black bg-ocean-green-400 p-1 font-bold shadow-lg hover:bg-ocean-green-200"
              onClick={() => setOpenTotals(!openTotals)}
            >
              {openTotals && !totalsCalculationComplete ? (
                <BiLoaderCircle className="h-7 w-7 animate-spin" />
              ) : (
                <PiProjectorScreenChartDuotone className="h-7 w-7" />
              )}
              <span className="hidden md:block">Totales</span>
            </button>
            <button
              className="flex items-stretch rounded border border-black bg-blue-950 p-1 font-bold text-white shadow-lg hover:bg-blue-900"
              onClick={() => setOpenFiltersBar(!openFiltersBar)}
            >
              <div className="flex h-full items-center">
                <MdOutlineFilterAlt />
              </div>
              <span className="flex items-center">Filtros</span>
            </button>
            {isAnyFilterApplied && (
              <button
                className="rounded border border-black bg-blue-400 p-1 font-bold shadow-lg hover:bg-blue-200"
                onClick={resetFilters}
              >
                <span className="flex items-center whitespace-nowrap text-sm">
                  Limpiar
                </span>
              </button>
            )}

            {openTotals && (
              <TotalsBox
                totalsCalculationComplete={totalsCalculationComplete}
                setTotalsCalculationComplete={setTotalsCalculationComplete}
                filteredEventLogs={filteredEventLogs}
                selectedClientSupplier={selectedClientSupplier}
                selectedUser={selectedUser}
                selectedOperation={selectedOperation}
                startDate={startDate}
                endDate={endDate}
                selectedTankType={selectedTankType}
                selectedTank={selectedTank}
                selectedDocumentType={selectedDocumentType}
                documentNumber={documentNumber}
              />
            )}
          </div>
        </div>

        <div className="flex h-fit flex-col text-xs md:flex-row md:gap-2 md:text-lg ">
          <div className="h-fit">
            De:{" "}
            {startDate && (
              <span className="font-bold">
                {startDate.format("DD-MM-YYYY")}
              </span>
            )}
          </div>
          <div className="h-fit">
            A:{" "}
            {endDate && (
              <span className="font-bold">{endDate.format("DD-MM-YYYY")}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 bg-gray-50 p-2 md:justify-evenly">
        {/* All Filters  */}

        <div className="flex w-full flex-wrap gap-1">
          {/* Client Supplier Filter*/}
          <label
            htmlFor="autocompleteInput"
            className="mb-2 block w-full text-sm font-bold"
          >
            Cliente / Proveedor
          </label>
          <div className="w-full md:w-auto md:flex-1">
            <Autocomplete
              inputValue={rut}
              setInputValue={setRut}
              setClientSupplier={setSelectedClientSupplier}
              suggestions={clientSupplierList.map((client) => ({
                value: client.rut,
                label: client.business_name,
              }))}
              autocompleteError={clientSupplierInputError}
              setAutocompleteError={setClientSupplierInputError}
            />
          </div>
          <div className="relative flex-1">
            <BiSolidCheckCircle
              className={`absolute right-4 top-2 h-6 w-6 text-green-600 transition-opacity duration-200 ease-in-out ${
                selectedClientSupplier ? "opacity-100" : "opacity-0"
              }`}
            />
            <input
              id="clientSupplierInput"
              name="clientSupplierInput"
              value={selectedClientSupplier}
              className="w-full rounded-lg border border-black bg-gray-200 px-3 py-2"
              disabled
            />
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <button
              className="rounded border border-red-400 p-2 text-xs font-bold text-red-500 shadow hover:bg-red-200"
              onClick={resetClientSupplierFilter}
            >
              Limpiar cliente
            </button>
          </div>
        </div>

        <div className="flex w-full gap-1 md:w-1/3">
          {/* User & Operation Filters  */}
          <div className="flex-1 gap-1">
            {/* User Selector */}
            <label
              htmlFor="userSelector"
              className="mb-2 block text-sm font-bold"
            >
              Usuario
            </label>
            <select
              id="userSelector"
              className="w-full rounded border border-gray-300 p-2"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value={ALL_VALUES}>{ALL_VALUES}</option>
              {Object.keys(filters.userFilters).map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 gap-1">
            {/* Operation Selector */}
            <label
              htmlFor="operationSelector"
              className="mb-2 block text-sm font-bold"
            >
              Operación
            </label>
            <select
              id="operationSelector"
              className="w-full rounded border border-gray-300 p-2"
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
            >
              <option value={ALL_VALUES}>{ALL_VALUES}</option>
              {Object.keys(filters.operationFilters).map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex w-full gap-1 md:w-1/3">
          {/* Tank Type & Tank Filters  */}
          <div className="flex-1 gap-1">
            {/* Type Selector */}
            <label
              htmlFor="tankTypeSelector"
              className="mb-2 block text-sm font-bold"
            >
              Tipo de estanque
            </label>
            <select
              id="tankTypeSelector"
              className="w-full rounded border border-gray-300 p-2"
              value={selectedTankType}
              onChange={(e) => setSelectedTankType(e.target.value)}
            >
              <option value={ALL_VALUES}>{ALL_VALUES}</option>
              {Object.keys(filters.tankTypeFilters).map((value) => (
                <option value={value} key={value}>
                  {value.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 gap-1">
            {/* Tank Selector */}
            <label
              htmlFor="tankSelector"
              className="mb-2 block text-sm font-bold"
            >
              Estanque
            </label>
            <select
              id="tankSelector"
              className="w-full rounded border border-gray-300 p-2"
              value={selectedTank}
              onChange={(e) => setSelectedTank(e.target.value)}
            >
              <option value={ALL_VALUES}>{ALL_VALUES}</option>
              {Object.keys(filters.tankFilters).map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-1 md:w-1/3">
          {/* Date Filters */}
          <div className="flex-1 gap-1">
            {/* At Date Selector  */}
            <label
              htmlFor="inputDateFrom"
              className="mb-2 block text-sm font-bold"
            >
              Desde:
            </label>
            <input
              id="inputDateFrom"
              onChange={(e) =>
                setStartDate(
                  moment(e.target.value, "YYYY-MM-DD").tz("America/Santiago"),
                )
              }
              type="date"
              value={startDate && startDate.format("YYYY-MM-DD")}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div className="flex-1 gap-1">
            {/* To Date Selector  */}
            <label
              htmlFor="inputDateTo"
              className="mb-2 block text-sm font-bold"
            >
              Hasta:
            </label>
            <input
              id="inputDateTo"
              onChange={(e) =>
                setEndDate(
                  moment(e.target.value, "YYYY-MM-DD").tz("America/Santiago"),
                )
              }
              type="date"
              value={endDate && endDate.format("YYYY-MM-DD")}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div className="flex w-full justify-end">
            <button
              className="rounded border border-ocean-green-400 p-2 text-xs font-bold text-ocean-green-500 shadow hover:bg-ocean-green-200"
              onClick={handleDateFilter}
            >
              Filtrar por fecha
            </button>
            <button
              className="ml-2 rounded border border-red-400 p-2 text-xs font-bold text-red-500 shadow hover:bg-red-200"
              onClick={resetDateAndFilters}
            >
              Limpiar fechas
            </button>
          </div>
        </div>

        <div className="flex w-full flex-wrap content-start gap-1 md:w-1/3">
          {/* Document Filters */}
          <div className="flex-1 gap-1">
            {/* Document Type Selector  */}
            <label
              htmlFor="documentTypeSelector"
              className="mb-2 block text-sm font-bold"
            >
              Tipo de documento
            </label>
            <select
              id="documentTypeSelector"
              className="w-full rounded border border-gray-300 p-2"
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
            >
              <option value={ALL_VALUES}>{ALL_VALUES}</option>
              {Object.keys(filters.documentTypeFilters).map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 gap-1">
            {/* Document Number Selector  */}
            <label
              htmlFor="documentNumberInput"
              className="mb-2 block text-sm font-bold"
            >
              Folio
            </label>
            <input
              id="documentNumberInput"
              type="number"
              value={documentNumber}
              className="w-full rounded border border-gray-300 p-2"
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>
          <div className="flex w-full justify-end">
            <button
              className="rounded border border-red-400 p-2 text-xs font-bold text-red-500 shadow hover:bg-red-200"
              onClick={resetDocumentNumberFilter}
            >
              Limpiar Folio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
