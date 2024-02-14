import React from "react";

const FilterDropdown = ({ filters, handleFilter, filterType }) => {
  // currently not in use
  return (
    <div className="absolute rounded-md bg-white p-2 text-black shadow-lg">
      {Object.keys(filters).map((filter) => (
        <label key={filter} className="flex items-center">
          <input
            type="checkbox"
            value={filter}
            checked={filters[filter]}
            onChange={() => handleFilter(filterType, filter)}
          />
          {filter}
        </label>
      ))}
    </div>
  );
};

export default FilterDropdown;
