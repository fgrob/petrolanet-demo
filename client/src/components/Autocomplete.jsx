import React, { useEffect, useRef, useState } from "react";

const Autocomplete = ({
  inputValue,
  setInputValue,
  setClientSupplier,
  suggestions,
  autocompleteError,
  setAutocompleteError,
}) => {
  const suggestionListRef = useRef(null);
  const inputRef = useRef(null);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setClientSupplier("");
    e.target.setCustomValidity("");

    const inputValue = e.target.value.toLowerCase().replace(/[.-]/g, "");

    const filtered = suggestions.filter((suggestion) => {
      const valueFilter = suggestion.value.toLowerCase().replace(/-/g, ""); // Regex removes hyphens
      const labelFilter = suggestion.label.toLowerCase().replace(/[.-]/g, ""); // Regex removes hyphens and periods
      return (
        valueFilter.includes(inputValue) || labelFilter.includes(inputValue)
      );
    });

    setFilteredSuggestions(filtered);
  };

  const handleClickSuggestion = (suggestion) => {
    setInputValue(suggestion.value);
    setClientSupplier(suggestion.label);
    setOpenSuggestions(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        suggestionListRef.current &&
        !suggestionListRef.current.contains(e.target) &&
        inputRef.current !== e.target
      ) {
        setOpenSuggestions(false);
      }
    };

    if (openSuggestions) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openSuggestions]);

  // If there are direct changes in the Input Filed, and its not empty, then the suggestion list must be opened
  useEffect(() => {
    if (!inputValue) {
      setOpenSuggestions(false);
    } else if (document.activeElement === inputRef.current) {
      setOpenSuggestions(true);
    }
  }, [inputValue]);

  useEffect(() => {
    const handleFocusChange = () => {
      if (document.activeElement !== inputRef.current) {
        setOpenSuggestions(false);
      }
    };

    document.addEventListener("focusin", handleFocusChange);

    return () => {
      document.removeEventListener("focusin", handleFocusChange);
    };
  }, []);

  // If there is a click inside the input field, open and update the suggestion list. If it is already open, close it
  const handleInputClick = () => {
    if (openSuggestions) {
      setOpenSuggestions(false);
    } else {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.value
          .toLowerCase()
          .replace(/-/g, "")
          .includes(inputValue.toLowerCase().replace(/[.-]/g, "")),
      );
      setFilteredSuggestions(filtered);
      setOpenSuggestions(true);
    }
  };

  //Laptop Key Enter Handler
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Autocomplete Error Message Handlers
  useEffect(() => {
    const input = document.getElementById("autocompleteInput");
    input.setCustomValidity(autocompleteError);
    input.reportValidity();
  }, [autocompleteError]);

  useEffect(() => {
    setAutocompleteError("");
  }, [inputValue]);

  return (
    <div className="relative">
      <input
        id="autocompleteInput"
        type="text"
        value={inputValue}
        ref={inputRef}
        onClick={handleInputClick}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        className="w-full rounded-lg border border-gray-400 px-3 py-2"
        autoComplete="off"
      />
      {openSuggestions && (
        <ul
          ref={suggestionListRef}
          className="absolute left-0 z-10 h-auto max-h-96 w-full overflow-auto rounded-b-lg border bg-gray-200 shadow md:max-h-80"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleClickSuggestion(suggestion)}
                className={`hover-bg-gray-200 cursor-pointer px-4 py-2 ${
                  index % 2 === 0 ? "bg-grey-300" : "bg-gray-50"
                }`}
              >
                {suggestion.value} {suggestion.label}
              </li>
            ))
          ) : (
            <li
              className="px-4 py-2 text-red-500"
              onClick={() => setOpenSuggestions(false)}
            >
              No se encontraron coincidencias.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
