import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/eventlog/`;

const config = (additionalHeaders = {}) => {
  return {
    headers: { ...additionalHeaders },
  };
};

const getEventLogs = (startDate, endDate, tankId) => {
  let url = API_URL + "all";

  if (startDate) {
    url += `?startDate=${startDate}`;
  }
  if (endDate) {
    url += (startDate ? "&" : "?") + `endDate=${endDate}`;
  }
  if (tankId !== undefined && tankId !== null) {
    url += (startDate || endDate ? "&" : "?") + `tankId=${tankId}`;
  }

  return axios.get(url);
};

const getLastErrorEvents = () => {
  // get the last 'measurement' event for all tanks
  return axios.get(API_URL + "errors", config());
};

const getMeasurementEvents = (tankId) => {
  // last 'measurement' for a specific tank
  return axios.get(API_URL + "measurementevents", { params: { tankId } });
};

const editEvent = (changedDataObject) => {
  const socketId = localStorage.getItem("socketId");
  return axios.put(
    API_URL + "editevent",
    { changedDataObject },
    config({ socketid: socketId }),
  );
};

const deleteEvent = (eventId) => {
  return axios.delete(API_URL + "delete/" + eventId);
};


const eventLogService = {
  getEventLogs,
  getLastErrorEvents,
  getMeasurementEvents,
  editEvent,
  deleteEvent,
};

export default eventLogService;
