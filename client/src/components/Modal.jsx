import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

const Modal = ({ height, weight, openModal, toggleModal, children }) => {
  // height, weight: for manual setting
  // openModal: true/false
  // toggleModal: function that handles openModal
  // children: all the inners divs you need

  const tankModalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openModal) {
        if (!tankModalRef.current.contains(e.target)) {
          toggleModal();
        }
      }
    };

    const handleKeyESC = (e) => {
      if (openModal) {
        if (e.key === "Escape") {
          toggleModal();
        }
      }
    };

    document.addEventListener("keydown", handleKeyESC);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyESC);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  useEffect(() => {
    // disables vertical scrolling (for movile)

    if (openModal) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openModal]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ease-in-out${
        openModal
          ? "visible opacity-100"
          : "pointer-events-none invisible opacity-0"
      }`}
    >
      <div
        ref={tankModalRef}
        className={`relative mx-2 flex overflow-auto ${
          weight ? weight : "w-full md:max-w-fit"
        } ${
          height ? height : "h-5/6 max-h-full  md:h-auto"
        } justify-center rounded-lg bg-white p-5 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] `}
        id="modal"
      >
        <button
          onClick={toggleModal}
          className="absolute right-1 top-1 z-50 h-9 w-9 md:top-2"
        >
          <IoClose className="h-full w-full" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
