import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';

export function ScreenEditor(props) {
	console.log(props);

	return (
		<View>
			<Text>I am the Editor {props.route.params.subj}</Text>
		</View>
	);
}