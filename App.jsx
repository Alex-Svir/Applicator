import './gesture-handler';

import React, { useState, useEffect } from 'react';
import {
	View,
//	SectionList,
//	Pressable,
	Text,
//	TextInput,
//	Button,
//	Switch,
	Alert,
	StyleSheet
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RNFS from 'react-native-fs';

import { ScreenGenerate } from './src/components/ScreenGenerate';
import { ScreenEditor } from './src/components/ScreenEditor';

import { EditorContext } from './src/data/EditorContext';


//const MAX_SKILLS_SINGLE_COLUMN = 8;
//const MIN_COVER_LETTER_SKILLS = 5;
//const MIN_RESUME_SKILLS = 8;


export default function App() {
//	const [company, setCompany] = useState('');
//	const [position, setPosition] = useState('');
	const [skillList, setSkillList] = useState('');
//	const [switches, setSwitches] = useState({});
//	const [skillsCount, setSkillsCount] = useState([0,0]);

	useEffect(
		() => {
			async function foo() {
				const path = RNFS.ExternalStorageDirectoryPath + '/Documents/Applicator/presets/skills.txt';
				try {
					const content = await RNFS.readFile(path);
								setSkillList(content.toString());

				} catch(err) {
					try {
						const content = DEFAULT_SKILLS_FILE_CONTENT;
						await RNFS.writeFile(path, content, 'utf8');
								setSkillList(content);
					} catch (err) {
						Alert.alert('Skills loading failed', err.message);
					}
				}
			};
			foo();
		},
		[]
	);

	const Stack = createNativeStackNavigator();

	return (
		<NavigationContainer>
			<EditorContext value={{ cletter: 'Cover Letter content', resume: 'Resume content', skillList }}>
				<Stack.Navigator>
					<Stack.Screen
						name="Generate"
						options={{ headerShown: false }} >
						{ props => <ScreenGenerate {...props} skills={skillList} /> }
					</Stack.Screen>

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



/*
const DEFAULT_SKILLS_FILE_CONTENT =
`Languages
C, C++
Java
Assembly
JavaScript
HTML
CSS
XML
JSON
Perl
SQL

Platforms
Android
Embedded software
ARM
Microcontrollers
Arduino
AWS
Web services
Mobile applications
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
Eclipse
Software development
Software troubleshooting
Debugging
Unit Testing
APIs
Full-stack development
Brainstorming
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
Goal-oriented
Experimenting
Listening

Coming soon
TypeScript
Gradle
Groovy`;

const DEFAULT_COVER_LETTER_PARAMS = {
	position: 'Entry-Level Software Developer',
	company: 'Company',
	date: 'MM/DD/YYYY',
	skills: [
		'Multi-threading', 'SQL Databases', 'Bluetooth',
		'Input Method Editor', 'Foreground Service', 'Sockets',
		'Screen Overlay'
	]
};

const DEFAULT_RESUME_PARAMS = {
	position: 'Entry-Level Software Developer',
	skills: [
		'C++', 'Android', 'Java', 'Analytical thinking',
		'Strong work ethics', 'Quick learning', 'Detail oriented',
		'Critical thinking', 'Goal-oriented', 'Listening'
	],
	certificates: [
		'Programming Hub C++ Certification Course',
		'Programming Hub C++ Advanced Certification Course',
		'Programming Hub Java Certification Course',
		'Programming Hub Java Advanced Certification Course',
		'Programming Hub Android Development Certification Course'
	]
};
*/
/*
function generateCoverLetter({ position, company, date, skills }) {
	return `
<html>
<head>
	<style>
		body {
			width: 8.5in;
			height: 11in;
			padding: 0.79in;
		}
		h1,p.hdr {
			margin: 0;
		}
		p.pos {
			font-size: 1.5em;
			margin-bottom: 0.5em;
		}
		th {
			text-align: left;
			font-weight: normal;
			width: 15ch;
		}
	</style>
</head>
<body>
	<h1>${persconf.name}</h1>
	<p class="hdr pos">${position}</p>
	<br>
	<table>
		<tbody>
		<tr>
			<th>Phone</th>
			<td>${persconf.phone}</td>
		</tr>
		<tr>
			<th>Email</th>
			<td><a href="mailto:${persconf.email}">${persconf.email}</a></td>
		</tr>
		<tr>
			<th>GitHub</th>
			<td><a href="https://github.com/${persconf.github}">https://github.com/${persconf.github}</a></td>
		</tr>
		</tbody>
	</table>
	<br>
	<p>Brighton,&emsp;&emsp;${date}</p>
	<br>
	<p>Dear ${company} Team,</p>

	<p>I was exited to find your posting for the position of ${position}.
	My way is out of the ordinary, almost 20 years I have studied programming
	by solving a wide  variety of practical problems. Each of my projects was
	a challenge, I went step by step from easy things to more complicated ones,
	so I was forced to resolve lots of minor problems on my way to my major goal.</p>

	<p>Over time, my enthusiasm and thirst for learning did not fade, but only
	intensified as I dove into computer science. Started with a simple curiosity,
	my programming hobby has turned into a real passion and now my mind is
	totally focused on it 24/7.</p>

	<p>When I cannot access my laptop, I read educational and tutorial
	publications or books, search the ways of resolving my current
	projects’ problems, analyze and plan my apps development. I never
	remember my night-dreams but it seems they are all about coding too.</p>

	<p>During many years of programming I developed a lot of various applications,
	mostly covering my current needs. So I experienced many experiments and learned
	many APIs, interfaces and technologies e. g.:</p>

	<ul>${skills.map(li => '<li>' + li + '</li>').join('')}
	</ul>

	<p>But at the same time, I have never thought this can become my occupation
	or source of money. So, now it’s time to direct my passion and desire for
	the benefit of humanity and ${company}.</p>

	<p>Can’t wait for instructions regarding my next steps from you! I’m eager
	to direct my skills and passion to meet business needs.</p>

	<p>Sincerely,</p>
	<p>${persconf.name}</p>
</body>
</html>
	`;
}
*/
/*
function generateResume({ position, skills, certificates }) {
	return `
<html>
<head>
	<style>
		body {
			width: 8.5in;
			height: 11in;
			padding: 0.79in;
		}
		h1,p.hdr {
			margin: 0;
		}
		p.pos {
			font-size: 1.5em;
			margin-bottom: 0.5em;
		}
		ul.skill {
			columns: ${skills.length > MAX_SKILLS_SINGLE_COLUMN ? 2 : 1};
		}
	</style>
</head>
<body>

	<h1>${persconf.name}</h1>
	<p class="hdr pos">${position}</p>
	<p class="hdr">${persconf.phone}</p>
	<p class="hdr"><a href="mailto:${persconf.email}">${persconf.email}</a></p>
	<p class="hdr"><a href="https://github.com/${persconf.github}">https://github.com/${persconf.github}</a></p>
	<br>

	<p>Enthusiastic, motivated, self-educated ${position} with strong practical
	background and great passion to coding. Spent almost 20 years learning C++,
	Java, Android and never stop developing, even when sleeping. Eager to direct
	my skills and passion to meet business needs.</p>

	<h2>Education</h2>

	<ul>Self education based on:
		<li>Almost 20 years of learning, developing, experimenting, investigating computer technologies</li>
    	<li>1000s hours of coding, debugging, fixing errors, resolving compiling problems</li>
    	<li>Great practical experience in C++, Android, Java</li>
    </ul>

	<ul>Belarusian State Medical University
		<li>2005 – 2011</li>
	</ul>

	<h2>Skills</h2>
	<ul class="skill">
		${skills.map( li => '<li>' + li + '</li>' ).join('')}
	</ul>

	<h2>Certification</h2>
	<ul>
		${certificates.map( li => '<li>' + li + '</li>' ).join('')}
	</ul>

	<h2>Languages</h2>
	<ul>
		<li>English</li>
		<li>Belarusian</li>
		<li>Russian</li>
    </ul>
</body>
</html>
	`;
}
*/