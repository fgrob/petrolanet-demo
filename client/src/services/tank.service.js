import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/tank/`;

const config = (additionalHeaders = {}) => {
  const socketId = localStorage.getItem("socketId")
  return {
    headers: { socketid: socketId, ...additionalHeaders },
  };
};

const getTanks = () => {
  return axios.get(API_URL + "all", config());
};

const transfer = (action, triggerTankId, selectedTankId, quantity, directTransfer, maxCapacity) => {
  return axios.put(
    API_URL + "transfer",
    {
      action,
      triggerTankId,
      selectedTankId,
      quantity,
      directTransfer,
      maxCapacity,
    },
    config(),
  );
};

const sellOrSupply = (
  action,
  triggerTankId,
  clientSupplierId,
  selectedDocument,
  documentNumber,
  quantity,
  notes,
) => {
  return axios.put(
    API_URL + "sellorsupply",
    {
      action,
      triggerTankId,
      clientSupplierId,
      selectedDocument,
      documentNumber,
      quantity,
      notes,
    },
    config(),
  );
};

const tankMeasurement = (triggerTankId, quantity, notes) => {
  return axios.put(
    API_URL + "measurement",
    {
      triggerTankId,
      quantity,
      notes,
    },
    config(),
  );
};

const adjustment = (tankId, changedData, notes) => {
  return axios.put(
    API_URL + "adjustment",
    { tankId, changedData, notes },
    config(),
  );
};

const createTank = (
  tankName,
  tankType,
  tankCapacity,
  tankGauge,
  tankNumber,
) => {
  return axios.post(
    API_URL + "create",
    {
      tankName,
      tankType,
      tankCapacity,
      tankGauge,
      tankNumber,
    },
    config(),
  );
};

const checkTankNumber = (
  tankId,
  tankBalance,
  tankNumber,
  notes,
) => {
  return axios.post(API_URL + "checktanknumber", { tankId, tankBalance, tankNumber, notes }, config())
}

const tankService = {
  getTanks,
  transfer,
  sellOrSupply,
  tankMeasurement,
  adjustment,
  createTank,
  checkTankNumber,
};

export default tankService;
