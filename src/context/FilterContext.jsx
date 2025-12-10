import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export function FilterProvider({ children }) {
    const [filterParams, setFilterParams] = useState({
        type: 'month', // 'month' or 'custom'
        value: new Date().toISOString().slice(0, 7), // YYYY-MM if type is month
        startDate: "", // Used if type is custom
        endDate: "",    // Used if type is custom
    });

    const [isValuesVisible, setIsValuesVisible] = useState(true);

    return (
        <FilterContext.Provider value={{ filterParams, setFilterParams, isValuesVisible, setIsValuesVisible }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    return useContext(FilterContext);
}
