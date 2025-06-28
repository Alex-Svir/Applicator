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
        case 'skillsSetup': {
            return {
                ...state,
                skillsArray: action.array,
                skillsSwitches: action.switches
            };
        }
        case 'switched': {
            return {
                ...state,
                skillsSwitches: {
                    ...state.skillsSwitches,
                    [action.section]: {
                        ...state.skillsSwitches[action.section],
                        [action.skill]: [
                            action.idx ? state.skillsSwitches[action.section][action.skill][0] : action.val,
                            action.idx ? action.val : state.skillsSwitches[action.section][action.skill][1]
                        ]
                    }
                },
                skillsCount: [
                    state.skillsCount[0] + (action.idx || action.val === state.skillsSwitches[action.section][action.skill][0] ? 0 : action.val ? 1 : -1),
                    state.skillsCount[1] + (!action.idx || action.val === state.skillsSwitches[action.section][action.skill][1] ? 0 : action.val ? 1 : -1)
                ]
            };
        }
        case 'skillscnt': {
            return { ...state, skillsCount: action.value };
        }
        case 'reset': {
            return {
                ...state,
                company: '',
                isRecruiter: true,
                position: '',
                shortPosition: '',
                skillsCount: [0,0],
                skillsSwitches: Object.fromEntries(
				    Object.entries(state.skillsSwitches).map(
					    ([key, val]) => [
						    key,
						    Object.fromEntries(
							    Object.keys(val).map( k => [k, [false, false]] )
						    )
					    ]
                    )
			    )
            };
        }

        default: throw new Error('Unrecognized action type');
    }
}

const initialData = {
    company: '',
    isRecruiter: true,
    position: '',
    shortPosition: '',
    skillsCount: [0, 0],
    skillsArray: [],
    skillsSwitches: {}
};