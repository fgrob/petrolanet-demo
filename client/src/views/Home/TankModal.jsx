import React, { useEffect, useState } from "react";
import TransferView from "./TransferView";
import SelectorView from "./SelectorView";
import ClientSupplierView from "./ClientSupplierView";
import MeasureStick from "./MeasureStick";
import ErrorsView from "./ErrorsView";
import Modal from "../../components/Modal";
import EventsView from "./EventsView";
import { IoArrowBack } from "react-icons/io5";

const TankModal = ({
  openModal,
  toggleModal,
  modalView,
  setModalView,
  modalViewOptions,
  action,
  triggerTank,
}) => {
  const [height, setHeight] = useState(null);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  useEffect(() => {
    setIsConfirmationVisible(false);
  }, [openModal]);

  return (
    <Modal openModal={openModal} toggleModal={toggleModal} height={height}>
      {/* Back Arrow */}
      {modalView !== modalViewOptions.SELECTOR &&
        modalView !== modalViewOptions.MEASURE &&
        modalView !== modalViewOptions.ERRORS &&
        modalView !== modalViewOptions.EVENTLOGS && (
          <button
            onClick={() => {
              isConfirmationVisible
                ? setIsConfirmationVisible(false)
                : setModalView(modalViewOptions.SELECTOR);
            }}
            className="absolute left-1 top-1"
          >
            <IoArrowBack className="h-9 w-9" />
          </button>
        )}

      {/* SELECTION MODAL */}
      {openModal && modalView === modalViewOptions.SELECTOR && (
        <SelectorView
          action={action}
          modalViewOptions={modalViewOptions}
          setModalView={setModalView}
        />
      )}
      {/* TRANSFER MODAL  */}
      {openModal && modalView === modalViewOptions.TRANSFER && (
        <TransferView
          action={action}
          triggerTank={triggerTank}
          toggleModal={toggleModal}
          openModal={openModal}
          isConfirmationVisible={isConfirmationVisible}
          setIsConfirmationVisible={setIsConfirmationVisible}
        />
      )}
      {/* CLIET/SUPPLIER MODAL */}
      {openModal &&
        (modalView === modalViewOptions.REFILL ||
          modalView === modalViewOptions.SALE) && (
          <ClientSupplierView
            action={action}
            triggerTank={triggerTank}
            toggleModal={toggleModal}
            isConfirmationVisible={isConfirmationVisible}
            setIsConfirmationVisible={setIsConfirmationVisible}
          />
        )}

      {/* TANK MEASUREMENT MODAL */}
      {openModal && modalView === modalViewOptions.MEASURE && (
        <MeasureStick triggerTank={triggerTank} toggleModal={toggleModal} />
      )}

      {/* ADJUSTMENT CHANGES MODAL */}
      {openModal && modalView === modalViewOptions.ERRORS && (
        <ErrorsView setHeight={setHeight} />
      )}
      {/* LAST MOVEMENTS MODAL  */}
      {openModal && modalView === modalViewOptions.EVENTLOGS && (
        <EventsView triggerTank={triggerTank} setHeight={setHeight} />
      )}
    </Modal>
  );
};

export default TankModal;
