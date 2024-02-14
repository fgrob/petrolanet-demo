import React, { useEffect, useState } from "react";
import eventLogService from "../services/eventLog.service";
import FiltersBar from "./Database/FiltersBar";
import DatabaseTable from "./Database/DatabaseTable";
import { BiLoaderCircle } from "react-icons/bi";

const Database = ({ setNavBarVisibility, setSideBarVisibility }) => {
  const [eventLogs, setEventLogs] = useState([]);
  const [filters, setFilters] = useState();
  const [filteredEventLogs, setFilteredEventLogs] = useState([]);
  const [clientSupplierList, setClientSupplierList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isTableReloading, setIsTableReloading] = useState(false); // for refetch eventlogs while keeping the currents filters
  const [apiError, setApiError] = useState("");

  const fetchEventLogs = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
      eventLogService
        .getEventLogs(startDate, endDate)
        .then((res) => {
          setEventLogs(res.data);
          setFilteredEventLogs(res.data);

          const { filters, clientSupplierList } =
            createFiltersAndClientSupplierList(res.data);
          setFilters(filters);
          setClientSupplierList(clientSupplierList);

          resolve();
        })
        .catch((err) => {
          setApiError(err.message);
          reject();
        })
        .finally(() => {
          setIsLoading(false);
          setIsTableReloading(false);
        });
    });
  };

  const createFiltersAndClientSupplierList = (eventLogs) => {
    const preClientSupplierList = [];

    const clientSupplierSet = new Set();
    const userSet = new Set();
    const operationSet = new Set();
    const tankTypeSet = new Set();
    const tankSet = new Set();
    const documentTypeSet = new Set();
    const documentNumberSet = new Set();

    eventLogs.forEach((eventLog) => {
      tankSet.add(eventLog.tank.name);
      operationSet.add(eventLog.operation.name);
      userSet.add(eventLog.user);
      tankTypeSet.add(eventLog.tank.type);

      if (eventLog.client) {
        clientSupplierSet.add(eventLog.client.business_name);
        preClientSupplierList.push({
          rut: eventLog.client.rut,
          business_name: eventLog.client.business_name,
        });
      }

      if (eventLog.supplier) {
        clientSupplierSet.add(eventLog.supplier.business_name);
        preClientSupplierList.push({
          rut: eventLog.supplier.rut,
          business_name: eventLog.supplier.business_name,
        });
      }

      eventLog.document_type && documentTypeSet.add(eventLog.document_type);
      eventLog.document_number &&
        documentNumberSet.add(eventLog.document_number);
    });

    const filters = {
      // First, we create an array using map with the values along with true, then we convert it into an object
      tankFilters: Object.fromEntries(
        [...tankSet].map((value) => [value, true]),
      ), // spread operator for make an array. A 'set' object is not an array
      tankTypeFilters: Object.fromEntries(
        [...tankTypeSet].map((value) => [value, true]),
      ),
      operationFilters: Object.fromEntries(
        [...operationSet].map((value) => [value, true]),
      ),
      userFilters: Object.fromEntries(
        [...userSet].map((value) => [value, true]),
      ),
      clientSupplierFilters: {
        "(SIN DATA)": true,
        ...Object.fromEntries(
          [...clientSupplierSet].map((value) => [value, true]),
        ),
      },
      documentTypeFilters: {
        "(SIN DATA)": true,
        ...Object.fromEntries(
          [...documentTypeSet].map((value) => [value, true]),
        ),
      },
      documentNumberFilters: {
        "(SIN DATA)": true,
        ...Object.fromEntries(
          [...documentNumberSet].map((value) => [value, true]),
        ),
      },
    };

    const uniqueValues = [];
    const clientSupplierList = preClientSupplierList.filter((element) => {
      const isDuplicate = uniqueValues.includes(element.rut);

      if (!isDuplicate) {
        uniqueValues.push(element.rut);
        return true;
      }
      return false;
    });

    return { filters, clientSupplierList };
  };

  const generateFilteredEventLogs = (eventLogs) => {
    // Filters the 'eventLogs' data based on selected filters and stores the result in the 'filteredEventLogs' state, which is used to construct the table.

    if (filters !== undefined) {
      const filteredData = eventLogs.filter((eventLog) => {
        let isClientFiltered = true;
        let isSupplierFiltered = true;

        eventLog.client &&
          (isClientFiltered =
            filters.clientSupplierFilters[eventLog.client.business_name]);
        eventLog.supplier &&
          (isSupplierFiltered =
            filters.clientSupplierFilters[eventLog.supplier.business_name]);
        if (!eventLog.client && !eventLog.supplier) {
          isClientFiltered = filters.clientSupplierFilters["(SIN DATA)"];
          isSupplierFiltered = filters.clientSupplierFilters["(SIN DATA)"];
        }

        const isUserFiltered = filters.userFilters[eventLog.user];
        const isOperationFiltered =
          filters.operationFilters[eventLog.operation.name];
        const isTankTypeFiltered = filters.tankTypeFilters[eventLog.tank.type];
        const isTankFiltered = filters.tankFilters[eventLog.tank.name];

        let isDocumentTypeFiltered = true;
        if (eventLog.document_type) {
          isDocumentTypeFiltered =
            filters.documentTypeFilters[eventLog.document_type];
        } else {
          isDocumentTypeFiltered = filters.documentTypeFilters["(SIN DATA)"];
        }

        let isDocumentNumberFiltered = true;
        if (eventLog.document_number) {
          isDocumentNumberFiltered =
            filters.documentNumberFilters[eventLog.document_number];
        } else {
          isDocumentNumberFiltered =
            filters.documentNumberFilters["(SIN DATA)"];
        }

        return (
          isClientFiltered &&
          isSupplierFiltered &&
          isUserFiltered &&
          isOperationFiltered &&
          isTankTypeFiltered &&
          isTankFiltered &&
          isDocumentTypeFiltered &&
          isDocumentNumberFiltered
        );
      });
      setFilteredEventLogs(filteredData);
    }
  };

  useEffect(() => {
    fetchEventLogs();

    setNavBarVisibility(false);
    setSideBarVisibility(false);

    return () => {
      setNavBarVisibility(true);
      setSideBarVisibility(true);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden border bg-white pt-1">
      {isLoading ? (
        <div className="flex h-screen items-center justify-center ">
          <BiLoaderCircle className="animate-spin text-2xl text-blue-500" />
        </div>
      ) : (
        <>
          {!apiError ? (
            <>
              <FiltersBar
                eventLogs={eventLogs}
                filters={filters}
                setFilters={setFilters}
                generateFilteredEventLogs={generateFilteredEventLogs}
                filteredEventLogs={filteredEventLogs}
                clientSupplierList={clientSupplierList}
                fetchEventLogs={fetchEventLogs}
                setIsTableReloading={setIsTableReloading}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
              <DatabaseTable
                filteredEventLogs={filteredEventLogs}
                isTableReloading={isTableReloading}
                fetchEventLogs={fetchEventLogs}
                filters={filters}
                setFilters={setFilters}
                setIsTableReloading={setIsTableReloading}
                startDate={startDate}
                endDate={endDate}
              />
            </>
          ) : (
            <div className="text-center font-bold text-red-500">{apiError}</div>
          )}
        </>
      )}
    </div>
  );
};

export default Database;
