import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export function FilterProvider({ children }) {
    const [filterParams, setFilterParams] = useState({
        type: 'month', // 'month' or 'custom'
        value: new Date().toISOString().slice(0, 7), // YYYY-MM if type is month
        startDate: "", // Used if type is custom
        endDate: "",    // Used if type is custom
        isValuesVisible: true // New privacy state
    });

    return (
        <FilterContext.Provider value={{ filterParams, setFilterParams }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    return useContext(FilterContext);
}
