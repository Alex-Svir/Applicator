import React, { useState, useContext } from 'react';
import {
	View,
	TextInput,
	StyleSheet
} from 'react-native';

import { EditorContext } from '../data/EditorContext';

export function ScreenEditor({ navigation, route }) {
	const { subj } = route.params;
	const ctx = useContext(EditorContext);
	const [text, setText] = useState( ctx[subj] );

//	filedata.fname
//	route.params.subj

	return (
		<View>
			<TextInput
				multiline={true}
				value={text}
				onChangeText={txt => setText(txt)}
			/>
		</View>
	);
}