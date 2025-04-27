import React, { useState, useEffect, useContext } from 'react';
import {
	View,
	TextInput,
	Text,
	Pressable,
//	StyleSheet
} from 'react-native';

import { EditorContext } from '../data/EditorContext';

export function ScreenEditor({ navigation, route }) {
	const { subj } = route.params;
	const ctx = useContext(EditorContext);
	const [text, setText] = useState( ctx[subj] );

//	filedata.fname
//	route.params.subj

	useEffect(
		() => navigation.setOptions({
				title: "Edit " + (subj === 'cletter' ? 'cover letter' : subj ),
				headerRight: () => (
					<Pressable
						onPress={() => ctx.onSave(subj, text)}
						disabled={ctx[subj] === text}
					>
						<Text style={{ fontWeight: 'bold', color: ctx[subj]===text ? 'grey' : 'blue' }}>
							Save
						</Text>
					</Pressable>
				)
		}),
			[navigation, text, subj, ctx[subj]]
	);

	return (
		<View style={{ height: '100%' }}>
			<TextInput
				style={{
					borderColor: 'black',
					borderWidth: 1,
					borderRadius: 6,
					margin: 20,
					flexGrow: 1,
					backgroundColor: 'white',
					textAlignVertical: 'top'
				}}
				multiline={true}
				value={text}
				onChangeText={txt => setText(txt)}
			/>
		</View>
	);
}