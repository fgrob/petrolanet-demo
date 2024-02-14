import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import clientService from "../services/client.service";
import supplierService from "../services/supplier.service";
import Modal from "../components/Modal";
import CreateAndEditModal from "./ClientSupplierAdjustment/CreateAndEditModal";
import { BiLoaderCircle } from "react-icons/bi";
import { CiEdit } from "react-icons/ci";

const ClientSupplierAdjustment = ({ target }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientSupplierList, setClientSupplierList] = useState([]);
  const [filteredClientSupplierList, setFilteredClientSupplierList] = useState(
    [],
  );

  const [openModal, setOpenModal] = useState(false);
  const { openBackdrop, setOpenBackdrop } = useContext(AppContext);

  const [rut, setRut] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [alias, setAlias] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [idToEdit, setIdToEdit] = useState();

  const [searchValue, setSearchValue] = useState("");

  const [apiError, setApiError] = useState("");

  const getData = () => {
    if (target === "clients") {
      clientService
        .getClients("adjustments")
        .then((res) => {
          setClientSupplierList(res.data);
        })
        .catch((err) => {
          setApiError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (target === "suppliers") {
      supplierService
        .getSuppliers("adjustments")
        .then((res) => {
          setClientSupplierList(res.data);
        })
        .catch((err) => {
          setApiError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const toggleModal = () => {
    if (openModal === true) {
      setRut("");
      setBusinessName("");
      setAlias("");

      setEditMode(false);
      setIdToEdit("");
    }
    setOpenModal(!openModal);
    setOpenBackdrop(!openBackdrop);
  };

  const handleEdition = (id, rut, businessName, alias) => {
    setEditMode(true);
    setIdToEdit(id);
    setRut(rut);
    setBusinessName(businessName);
    setAlias(alias);

    toggleModal();
  };

  const handleSearch = (e) => {
    let value;
    if (e) {
      value = e.target.value;
    } else {
      value = searchValue;
    }
    value = value.toUpperCase();
    const result = [];
    for (const clientSupplier of clientSupplierList) {
      if (
        clientSupplier.business_name.includes(value) ||
        clientSupplier.rut.includes(value) ||
        clientSupplier.alias.includes(value)
      ) {
        result.push(clientSupplier);
      }
    }
    setSearchValue(value);
    setFilteredClientSupplierList(result);
  };

  const cleanSearchInput = () => {
    setSearchValue("");
    setFilteredClientSupplierList([...clientSupplierList]);
  };

  useEffect(() => {
    getData();
  }, [target]);

  useEffect(() => {
    setFilteredClientSupplierList(clientSupplierList);
    if (clientSupplierList.length > 0) {
      handleSearch();
    }
  }, [clientSupplierList]);

  return (
    <>
      {isLoading ? (
        <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center">
          <BiLoaderCircle className="animate-spin text-2xl text-blue-500" />
        </div>
      ) : (
        <div>
          {!apiError ? (
            <div className="flex h-screen w-full flex-col overflow-hidden text-center shadow-md lg:h-full lg:p-3">
              <div className="flex flex-wrap justify-center p-1">
                <button
                  className="btn-success-small my-2 whitespace-nowrap bg-yellow-400 px-4 font-bold md:my-auto"
                  onClick={toggleModal}
                >
                  Añadir{" "}
                  {target === "clients" ? (
                    <span>Cliente</span>
                  ) : (
                    <span>Proveedor</span>
                  )}
                </button>
                <div className="ml-auto flex flex-1 justify-end gap-1 md:ml-10">
                  <label className="font-bold" htmlFor="searchInput">
                    Buscar
                  </label>
                  <input
                    id="searchInput"
                    className="flex-1 rounded-lg border border-gray-400 md:w-1/2 lg:flex-initial"
                    value={searchValue}
                    onChange={handleSearch}
                  />
                  <button
                    className="btn-error-small"
                    onClick={cleanSearchInput}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="w-full flex-1 overflow-auto">
                <table className="w-full table-auto divide-y divide-gray-200">
                  <thead className="sticky top-0 bg-gradient-to-r from-gray-400 to-gray-300 ">
                    <tr className="text-xs uppercase tracking-wider">
                      <th className="px-3 py-3">RUT</th>
                      <th className="px-3 py-3">RAZÓN SOCIAL</th>
                      <th className="whitespace-nowrap px-3 py-3">ALIAS</th>
                      <th className="px-3 py-3">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredClientSupplierList
                      .sort((a, b) => a.id - b.id)
                      .map((clientSupplier, index) => (
                        <tr
                          className={index % 2 === 0 ? "" : "bg-gray-100"}
                          key={clientSupplier.id}
                        >
                          <td className=" whitespace-nowrap">
                            {clientSupplier.rut}
                          </td>
                          <td
                            className={`whitespace-nowrap px-6 text-sm text-gray-900`}
                          >
                            {clientSupplier.business_name}
                          </td>
                          <td>{clientSupplier.alias}</td>
                          <td>
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() =>
                                  handleEdition(
                                    clientSupplier.id,
                                    clientSupplier.rut,
                                    clientSupplier.business_name,
                                    clientSupplier.alias,
                                  )
                                }
                              >
                                <CiEdit />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-red-500">{apiError}</div>
          )}
        </div>
      )}
      {openModal && (
        <Modal
          openModal={openModal}
          toggleModal={toggleModal}
          height="auto"
          weight="w-full md:w-1/2"
        >
          <CreateAndEditModal
            toggleModal={toggleModal}
            target={target}
            setClientSupplierList={setClientSupplierList}
            editMode={editMode}
            idToEdit={idToEdit}
            clientSupplierList={clientSupplierList}
            rut={rut}
            setRut={setRut}
            businessName={businessName}
            setBusinessName={setBusinessName}
            alias={alias}
            setAlias={setAlias}
          />
        </Modal>
      )}
    </>
  );
};

export default ClientSupplierAdjustment;
