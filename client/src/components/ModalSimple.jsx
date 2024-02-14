import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

const ModalSimple = ({ content, toggleModal }) => {
  const tankModalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!tankModalRef.current.contains(e.target)) {
        toggleModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-screen place-items-center justify-center">
      <div
        className="max-h-64 w-3/4 overflow-auto rounded-lg border border-gray-500 bg-gray-200 shadow-xl"
        ref={tankModalRef}
      >
        <div className="text-end">
          <button className="h-7 w-7" onClick={toggleModal}>
            <IoClose className="h-full w-full" />
          </button>
        </div>
        <div className="my-3 break-words p-2 px-2">{content}</div>
      </div>
    </div>
  );
};

export default ModalSimple;
