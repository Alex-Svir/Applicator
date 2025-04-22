import React, { useState, useEffect } from 'react';
import {
	View,
	SectionList,
	Pressable,
	Text,
	TextInput,
	Button,
	Switch,
	Alert,
//			ToastAndroid,
	StyleSheet
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
//import RNFS from 'react-native-fs';

import { persconf } from '../../persconfig';


const MAX_SKILLS_SINGLE_COLUMN = 8;
const MIN_COVER_LETTER_SKILLS = 5;
const MIN_RESUME_SKILLS = 8;


export function ScreenGenerate({ skills, navigation, route }) {
	const [company, setCompany] = useState('');
	const [position, setPosition] = useState('');
	const [skillsCount, setSkillsCount] = useState([0,0]);
	const [skillList, setSkillList] = useState([]);
	const [switches, setSwitches] = useState({});

	const [sideOpen, setSideOpen] = useState(false);

	useEffect(
		() => {
			const arr = skills.split(/\n{2,}/).filter(d => d)
									.map( d => d.split('\n').filter(i => i) );
			const sw = Object.fromEntries(
				arr.map( a => [ a[0], Object.fromEntries(
					a.filter((x,i) => i > 0).map( b => [b, [false, false]] )
				) ] )
			);
			setSkillList(arr);
			setSwitches(sw);
		},
		[skills]
	 );

	async function generatePdf() {
		try {
			const coverLetter = await RNHTMLtoPDF.convert({
				html: generateCoverLetter({
					position,
					company,
					date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
					skills: Object.values(switches).flatMap( sect => Object.entries(sect).filter(([key, [cl,res]]) => cl).map(([key, val]) => key) )
				}),
				fileName: 'CoverLetter',
				directory: 'Applicator'
			});
			const resume = await RNHTMLtoPDF.convert({
				html: generateResume({
					...DEFAULT_RESUME_PARAMS,
					position,
					skills: Object.values(switches).flatMap( sect => Object.entries(sect).filter(([key, [cl,res]]) => res).map(([key, val]) => key) )
				}),
				fileName: 'Resume',
				directory: 'Applicator'
			});
			Alert.alert('Generated PDF', `Saved at\n\n${coverLetter.filePath}\n\n${resume.filePath}`);
		} catch(err) {
			Alert.alert('ERROR', err.message);
		}
	}

/*
	useEffect(
		() => {
			async function foo() {
				const path = RNFS.ExternalStorageDirectoryPath + '/Documents/Applicator/presets/skills.txt';
				try {
					const content = await RNFS.readFile(path);
					const arr = content.toString().split(/\n{2,}/).filter(d => d).map( d => d.split('\n').filter( i => i ) );
					const sw = Object.fromEntries(
						arr.map( a => [ a[0], Object.fromEntries(
							a.filter((x,i) => i > 0).map( b => [b, [false, false]] )
						) ] )
					);
					setSkillList(arr);
					setSwitches(sw);
				} catch(err) {
					try {
						const content = DEFAULT_SKILLS_FILE_CONTENT;
						await RNFS.writeFile(path, content, 'utf8');
						const arr = content.toString().split(/\n{2,}/).filter(d => d).map( d => d.split('\n').filter( i => i ) );
						const sw = Object.fromEntries(
							arr.map( a => [ a[0], Object.fromEntries(
								a.filter((x,i) => i > 0).map( b => [b, [false, false]] )
							) ] )
						);
						setSkillList(arr);
						setSwitches(sw);
					} catch (err) {
						Alert.alert('Skills loading failed', err.message);
					}
				}
			};
			foo();
		},
		[]
	);
*/
	return (
		<Drawer
				open={sideOpen}
				onOpen={ () => setSideOpen(true) }
				onClose={ () => setSideOpen(false) }
				renderDrawerContent={ () => {
					return <SideBar onPress={ subj => {
						setSideOpen(false);
						navigation.navigate('Edit', {subj});
					} } />;
				} }
			//	drawerStyle={styles.side}
				swipeEdgeWidth={60}
				swipeMinInstance={20}
			>
			<View
				style={styles.root} >
				<View
					style={styles.genButton}>
					<Button
						title="GENERATE"
						onPress={ () => {
							const [clSkillsCnt, resSkillsCnt] = Object.values(switches)
									.flatMap( sect => Object.values(sect) )
									.reduce(
										(acc, [cl, res]) => {
											if (cl) acc[0]++;
											if (res) acc[1]++;
											return acc;
										},
										[0,0]
									);
							if (clSkillsCnt !== skillsCount[0] || resSkillsCnt !== skillsCount[1]) {
								setSkillsCount([ clSkillsCnt, resSkillsCnt ]);
							}
							if (clSkillsCnt >= MIN_COVER_LETTER_SKILLS && resSkillsCnt >= MIN_RESUME_SKILLS) {
								generatePdf();
							} else {
								Alert.alert("Not enough skills", "Select some more skills");
							}
						} }
						disabled={!company || !position || skillsCount[0] < MIN_COVER_LETTER_SKILLS || skillsCount[1] < MIN_RESUME_SKILLS}
					/>
				</View>
				<Text style={styles.label}>Company</Text>
				<TextInput
					style={styles.input}
					value={company}
					placeholder={'Company Name'}
					onChangeText={ txt => setCompany(txt) } />
				<Text style={styles.label}>Position</Text>
				<TextInput
					style={styles.input}
					value={position}
					placeholder={'Position'}
					onChangeText={ txt => setPosition(txt) } />

				<View style={styles.skillsSummary}>
					<Pressable
						onPress={() => Alert.alert(
							'Cover Letter skills:',
							skillList.flatMap(
								sec => sec.filter( (sk, i) => i > 0 )
										.filter( sk => switches[sec[0]][sk][0] )
							).join('\n')
						)} >
						<Text
							style={styles.skillsSummaryText}>
							{skillsCount[0]}
						</Text>
					</Pressable>
					<Pressable
						onPress={() => Alert.alert(
							'Resume skills:',
							skillList.flatMap(
								sec => sec.filter( (sk, i) => i > 0 )
										.filter( sk => switches[sec[0]][sk][1] )
							).join('\n')
						)} >
						<Text
							style={styles.skillsSummaryText}>
							{skillsCount[1]}
						</Text>
					</Pressable>
				</View>

				<Skills
					skills={skillList}
					switches={switches}
					onSwitch={ (section, skill, idx, val) => {
						setSwitches(
							sw => ({
								...sw,
								[section]: {
									...sw[section],
									[skill]: [
										idx ? sw[section][skill][0] : val,
										idx ? val : sw[section][skill][1]
									]
								}
							})
						);
						setSkillsCount(
							([cl,res]) => [
								//idx ? cl : cl + (val ? 1 : -1 ),
								cl + (idx || val === switches[section][skill][0] ? 0 : val ? 1 : -1 ),
								//idx ? res + (val ? 1 : -1) : res
								res + (!idx || val === switches[section][skill][1] ? 0 : val ? 1 : -1)
							]
						);
					} }
				/>
			</View>
		</Drawer>
	);
}

function SideBar({ onPress }) {
	return	<View style={styles.side}>
				<NaviButton label={'Skills'} onPress={ () => onPress('skillList') } />
				<NaviButton label={'Cover Letter'} onPress={ () => onPress('cletter') } />
				<NaviButton label={'Resume'} onPress={ () => onPress('resume') } />
			</View>;
}

function NaviButton({ label, onPress }) {

	return (
		<Pressable
			style={{ ...styles.sideButton, display: 'flex', flexDirection: 'row' }}
			onPress={onPress}
		>
			<Text>img</Text>
			<Text>{label}</Text>
		</Pressable>
	);
}

function Skills({ skills, switches, onSwitch }) {
	const [selected, setSelected] = useState('');

	const content = skills.map( sk => Object.fromEntries([
		['nm', sk[0]],
		['data', sk.slice(1)]
	]) );

	return (
		<SectionList
			sections={content}
			renderItem={ props => props.section.nm !== selected ? null :
				<SkillItem
					{...props}
					switches={switches[props.section.nm][props.item]}
					onSwitch={ (idx, val) => onSwitch(props.section.nm, props.item, idx, val) }
				/> }
			renderSectionHeader={ ({section: {nm}}) =>
				<SkillHeader
					key={nm}
					text={nm}
					selected={nm === selected}
					switches={switches[nm]}
					onPress={ () => setSelected(selected === nm ? '' : nm) }
					onSwitch={ (idx, val) => Object.keys(switches[nm]).forEach( key => onSwitch(nm, key, idx, val) ) }
				/> }
		/>
	);
}

function SkillHeader({ text, selected, switches, onPress, onSwitch }) {
	const [clCnt, resCnt, totalCnt] = Object.values(switches).reduce(
		(acc, [cl,res]) => {
			if (cl) acc[0]++;
			if (res) acc[1]++;
			acc[2]++;
			return acc;
		},
		[0, 0, 0]
	);

	return (
		<Pressable style={styles.skillHeader} onPress={onPress}>
			<Text style={styles.skillHeaderTitle}>
				{selected ? '\u261F' : '\u261E'}
				&emsp;
				{text}
			</Text>
			{ selected ?
				<>
				<Switch value={clCnt === totalCnt} onValueChange={ val => onSwitch(0, val) } />
				<Switch value={resCnt === totalCnt} onValueChange={ val => onSwitch(1, val) } />
				</> :
				<Text style={styles.skillHeaderStat}>{`${totalCnt}>> ${clCnt} / ${resCnt}`}</Text>
			}
		</Pressable>
	);
}

function SkillItem({ item, index, section, separators, switches, onSwitch }) {

	return (
		<View style={styles.skillItem}>
			<Text style={styles.skillName}>{index + 1}.) {item ?? '--'}</Text>
				<Switch value={switches[0]} onValueChange={ val => onSwitch(0, val) } />
				<Switch value={switches[1]} onValueChange={ val => onSwitch(1, val) } />
		</View>
	);
}
//**************************************************************************************************\\
//**************************************************************************************************\\

const styles = StyleSheet.create({
	root: {
		height: '100%'
	},
	genButton: {
		marginHorizontal: 8,
		marginVertical: 25
	},
	label: {
		marginHorizontal: 8,
		marginTop: 4
	},
	input: {
		marginHorizontal: 8,
		marginBottom: 4,
		borderColor: 'blue',
		borderWidth: 2,
		borderRadius: 4
	},
	skillsSummary: {
		alignSelf: 'flex-end',
		marginTop: 20,
		marginRight: 8,
		marginBottom: 10,
		display: 'flex',
		flexDirection: 'row'
	},
	skillsSummaryText: {
		fontSize: 22,
		fontWeight: 'bold',
		fontStyle: 'italic',
		paddingVertical: 4,
		paddingHorizontal: 16
	},
	skillHeader: {
		backgroundColor: 'aquamarine',
		borderColor: 'white',
		borderWidth: 1,
		padding: 5,
		display: 'flex',
		flexDirection: 'row'
	},
	skillHeaderTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		flexGrow: 1
	},
	skillHeaderStat: {
		fontSize: 18,
		fontWeight: 'bold',
		fontStyle: 'italic',
		marginRight: 20
	},
	skillItem: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderColor: 'red',
		borderWidth: 1,
		backgroundColor: '#cf4',
		paddingHorizontal: 6,
		paddingVertical: 2
	},
	skillName: {
		flexGrow: 1,
		backgroundColor: 'yellow',
		marginLeft: 6
	},
	side: {
		backgroundColor: 'yellow',
		height: '100%',
	//	width: '100%',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	sideButton: {
		borderColor: 'navy',
		borderWidth: 2,
		width: '100%',
	//	height: 60,
		padding: 8
	}
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
*/
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
