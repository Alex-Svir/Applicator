import { createContext } from 'react';

export const EditorContext = createContext({
	cletter: 'Cover Letter content',
	resume: 'Resume content',
	skills: 'skills\ndefault',
	onSave: null
});