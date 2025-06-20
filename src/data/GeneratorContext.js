import { createContext, useContext, useReducer } from "react";



const GeneratorContext = createContext(null);
const GeneratorDispatchContext = createContext(null);

export function useGeneratorData() {
    return useContext(GeneratorContext);
}

export function useGeneratorDispatch() {
    return useContext(GeneratorDispatchContext);
}

export function GeneratorDataProvider({ children }) {
    const [data, dispatch] = useReducer(generatorReducer, initialData);

    return(
        <GeneratorContext value={data} >
            <GeneratorDispatchContext value={dispatch}>
                { children }
            </GeneratorDispatchContext>
        </GeneratorContext>
    );
}

function generatorReducer(state, action) {
    switch (action.type) {
        case 'company': {
            return { ...state, company: action.text };
        }
        case 'recruiter': {
            return { ...state, isRecruiter: action.is };
        }
        case 'position': {
            return { ...state, position: action.text };
        }
        case 'shortpos': {
            return { ...state, shortPosition: action.text ?? state.position }
        }

        default: throw new Error('Unrecognized action type');
    }
}

const initialData = {
    company: '',
    isRecruiter: true,
    position: '',
    shortPosition: ''
};