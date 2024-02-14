import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/client/`;

const config = (additionalHeaders = {}) => {
  return {
    headers: { ...additionalHeaders },
  };
};

const getClients = (callerInfo) => {
  return axios.get(API_URL + "all", config({ "x-caller-info": callerInfo }));
};

const createClient = (rut, businessName, alias) => {
  return axios.post(
    API_URL + "adjustments/create",
    {
      rut,
      businessName,
      alias,
    },
  );
};

const editClient = (id, rut, businessName, alias) => {
  return axios.put(
    API_URL + "adjustments/edit",
    {
      id,
      rut,
      businessName,
      alias,
    },
  );
};

const clientService = {
  getClients,
  createClient,
  editClient,
};

export default clientService;
