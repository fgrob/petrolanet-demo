import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/supplier/`;

const config = (additionalHeaders = {}) => {
  return {
    headers: { ...additionalHeaders },
  };
};

const getSuppliers = (callerInfo) => {
  return axios.get(API_URL + "all", config({ "x-caller-info": callerInfo }));
};

const createSupplier = (rut, businessName, alias) => {
  return axios.post(
    API_URL + "create",
    {
      rut,
      businessName,
      alias,
    },
  );
};

const editSupplier = (id, rut, businessName, alias) => {
  return axios.put(
    API_URL + "edit",
    {
      id,
      rut,
      businessName,
      alias,
    },
  );
};

const supplierService = {
  getSuppliers,
  createSupplier,
  editSupplier,
};

export default supplierService;
