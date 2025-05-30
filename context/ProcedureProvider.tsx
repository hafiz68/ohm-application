import { createContext, useContext, useState } from 'react';

// Define the type for your context value
type ProcedureContextType = {
    currentProcedureIndex: number;
    setCurrentProcedureIndex: (index: number) => void;
};

// Create the context with a default value
const ProcedureContext = createContext<ProcedureContextType>({
    currentProcedureIndex: 0,
    setCurrentProcedureIndex: () => { }, // Empty function as default
});

export const ProcedureProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentProcedureIndex, setCurrentProcedureIndex] = useState(0);

    return (
        <ProcedureContext.Provider value={{ currentProcedureIndex, setCurrentProcedureIndex }}>
            {children}
        </ProcedureContext.Provider>
    );
};

// Custom hook with proper typing
export const useProcedureContext = (): ProcedureContextType => {
    const context = useContext(ProcedureContext);
    if (!context) {
        throw new Error('useProcedureContext must be used within a ProcedureProvider');
    }
    return context;
};