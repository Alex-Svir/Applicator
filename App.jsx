import './gesture-handler';

import React, { useState, useEffect } from 'react';
import {
	ToastAndroid,
	Alert,
	StyleSheet
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RNFS from 'react-native-fs';

import { ScreenGenerateTabbed as ScreenGenerate } from './src/components/ScreenGenerate';
import { ScreenEditor } from './src/components/ScreenEditor';

import { EditorContext } from './src/data/EditorContext';


export const APP_DIR_PATH = '/Documents/Applicator/';
const PRESETS_PATH = APP_DIR_PATH + 'presets/';
export const ARCHIVE_PATH = APP_DIR_PATH + 'archive/';

async function loadFile(fname, defaultContent) {
	const path = RNFS.ExternalStorageDirectoryPath + PRESETS_PATH + fname;
	try {
		const content = await RNFS.readFile(path);
		return content.toString();
	} catch (err) {
		try {
			await RNFS.writeFile(path, defaultContent, 'utf8');
		} catch (err) {
			ToastAndroid.show(`Failed loading ${fname}\n${err.message}`, ToastAndroid.LONG);
			Alert.alert(`Failed loading ${fname}\n${err.message}`);
		}
		return defaultContent;
	}
}

async function saveFile(fname, content) {
	const path = RNFS.ExternalStorageDirectoryPath + PRESETS_PATH + fname;
	try {
		await RNFS.writeFile(path, content, 'utf8');
		return true;
	} catch (err) {
		ToastAndroid.show(`Failed saving ${fname}\n${err.message}`, ToastAndroid.LONG);
		Alert.alert(`Failed saving ${fname}\n${err.message}`);
		return false;
	}
}


export default function App() {
	const [cletter, setCletter] = useState('');
	const [resume, setResume] = useState('');
	const [skills, setSkills] = useState('');

	useEffect(
		() => {
			async function foo() {
				const cl = await loadFile('cletter.txt', DEFAULT_COVER_LETTER_FILE_CONTENT);
				/*if (typeof cl === 'string')*/ setCletter(cl);
				const res = await loadFile('resume.txt', 'DEFAULT_RESUME_FILE_CONTENT');
				/*if (typeof res === 'string')*/ setResume(res);
				const sk = await loadFile('skills.txt', DEFAULT_SKILLS_FILE_CONTENT);
				/*if (typeof sk === 'string')*/ setSkills(sk);
			};
			foo();
		},
		[]
	);

	const Stack = createNativeStackNavigator();

	return (
		<NavigationContainer>
			<EditorContext
				value={{
					cletter,
					resume,
					skills,
					onSave: (subj, content) => {
						if (!saveFile(subj + '.txt', content)) return;
						switch(subj) {
							case 'skills':	setSkills(content);		return;
							case 'cletter':	setCletter(content);	return;
							case 'resume':	setResume(content);		return;
							default: throw new Error('Unacceptable subject');
						}
					}
				}}
			>
				<Stack.Navigator>
					<Stack.Screen
						name="Generate"
						component={ ScreenGenerate }
						options={{ headerShown: false }}
					/>

					<Stack.Screen
						name="Edit"
						component={ ScreenEditor }
					/>
				</Stack.Navigator>
			</EditorContext>
		</NavigationContainer>
	);
}

//**************************************************************************************************\\
//**************************************************************************************************\\

const styles = StyleSheet.create({
//	root: { height: '100%' },
});

/**********************************************************************************************************\
 *
 *
\**********************************************************************************************************/



const DEFAULT_SKILLS_FILE_CONTENT =
`Languages
C, C++
Java
Assembly
JavaScript
TypeScript
HTML
CSS
XML
JSON
HTTP
Perl
SQL

Platforms
Android
Embedded software
ARM
Microcontrollers
Arduino
Apache2
AWS
Web services
Mobile applications
Docker
SQLite
MySQL
Linux
Windows

Frameworks
React
React-Native
Node.js

Titles
OOP
SDKs
GitHub
Git
Version Control
Eclipse
Software development
Software troubleshooting
Debugging
Unit Testing
APIs
Full-stack development
Scripting
Bash
Shell Scripting
S3

Android
Multi-threading
SQL Databases
Bluetooth
Input Method Editor
Foreground Service
Sockets
Screen Overlay

C++
Multi-threading
Templates
Standard library

Java
Multi-threading
Generics
SQL databases

Soft-skills
Analytical thinking
Analysis skills
Critical thinking
Strong work ethics
Quick learning
Detail-oriented
Brainstorming
Goal-oriented
Experimenting
Listening

Coming soon
PHP
Gradle
Groovy`;



const DEFAULT_COVER_LETTER_FILE_CONTENT =

`Dear %%COMPANY%% Team,

I was excited to find your posting for the position of %%POSITION%%. I have an unusual path behind and a great path ahead! For more than 15 years, I have studied programming by solving a wide variety of practical problems.

I had no access to a PC until 17 years old. At that time, I passed my exams to enter a university. Within a year after a PC appeared in my household, curiosity pushed me to start my programming experiments. I learned C++ and Java, writing small apps for Windows and JavaME (smartphones were not widely used yet). Each of my projects was a challenge, I went step by step from easy things to more complicated ones, so I was forced to resolve lots of minor problems on my way to my major goal. Leak of academical approach is compensated with my thirst for knowledge and close attention to details. Diving deeply into a problem, discovering all and every aspect of it, lead to comprehensive knowledge of the problem.

A couple of years later, I got my first own laptop. Initially, there was no OS on it. First, I installed FreeDOS, and Linux was the next. I never chose a simple way. I state a problem and then resolve it, so this is my way to keep learning all the time.

Over time, my enthusiasm and thirst for learning did not fade, but only intensified as I dove into computer science. Started with a simple curiosity, my programming hobby has turned into a real passion, and now my mind is totally focused on it 24/7.

When I can not access my laptop, I'm still developing. I read educational and tutorial publications or books, search the ways of resolving my current projects’ problems, analyze and plan my apps development, write sketches on my smartphone or tablet, solve minor side problems. I never remember my night-dreams, but it seems they are all about coding, too.

During many years of programming, I developed a lot of various applications, mostly aiming at learning or covering my current needs. Most of my projects were wrappers for my desire to learn some particular feature. So I experienced many experiments and learned many APIs, interfaces and technologies e. g.:

%%SKILLS%%

But at the same time, I have never thought this could become my occupation or source of money. So, now it’s time to direct my passion and desire for the benefit of humanity and %%COMPANY_SELF%%.

Can’t wait for instructions regarding my next steps from you! I’m eager to direct my skills and passion to meet business needs.`;
