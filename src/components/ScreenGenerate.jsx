import React, { useState, useEffect, useContext } from 'react';
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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

import { persconf } from '../../persconfig';
import { EditorContext } from '../data/EditorContext';
import { GeneratorDataProvider, useGeneratorData, useGeneratorDispatch } from '../data/GeneratorContext.js';

import { APP_DIR_PATH, ARCHIVE_PATH } from '../../App.jsx';

const MAX_SKILLS_SINGLE_COLUMN_RESUME = 8;
const MAX_SKILLS_SINGLE_COLUMN_CLETTER = 6;
const MIN_COVER_LETTER_SKILLS = 5;
const MIN_RESUME_SKILLS = 8;


export function ScreenGenerate({ navigation, route }) {

	const { skills, cletter } = useContext(EditorContext);

	const [company, setCompany] = useState('');
	const [isRecruiter, setIsRecruiter] = useState(true);
	const [position, setPosition] = useState('');
	const [shortPosition, setShortPosition] = useState('');
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
			const fileMetaPath = RNFS.ExternalStorageDirectoryPath + APP_DIR_PATH + 'meta.txt';
			await RNFS.writeFile(
				fileMetaPath,
				position + '\n' + company + '\n' + genTimestamp(),
				'utf8'
			);

			const coverLetter = await RNHTMLtoPDF.convert({
				html: generateCoverLetter({
					pattern: cletter,
					position,
					shortPosition,
					company,
					isRecruiter,
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
					shortPosition,
					skills: Object.values(switches).flatMap( sect => Object.entries(sect).filter(([key, [cl,res]]) => res).map(([key, val]) => key) )
				}),
				fileName: 'Resume',
				directory: 'Applicator'
			});

			const fileCLetterTxtPath = RNFS.ExternalStorageDirectoryPath + APP_DIR_PATH + 'CoverLetter.txt';
			await RNFS.writeFile(
				fileCLetterTxtPath,
				genCoverLetterTxt({
					pattern: cletter,
					position,
					shortPosition,
					company,
					isRecruiter,
					skills: Object.values(switches).flatMap( sect => Object.entries(sect).filter(([key, [cl,res]]) => cl).map(([key, val]) => key) )
				}),
				'utf8'
			);

			Alert.alert('Generated PDF', `Saved at\n\n${coverLetter.filePath}\n\n${resume.filePath}\n\n${fileCLetterTxtPath}`);
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

	function reset() {
		setCompany('');
		setIsRecruiter(true);
		setPosition('');
		setShortPosition('');

		setSwitches(
			Object.fromEntries(
				Object.entries(switches).map(
					([key, val]) => [
						key,
						Object.fromEntries(
							Object.keys(val).map( k => [k, [false, false]] )
						)
					]
				)
			)
		);
		setSkillsCount([0,0]);
	}

	return (
		<Drawer
				open={sideOpen}
				onOpen={ () => setSideOpen(true) }
				onClose={ () => setSideOpen(false) }
				renderDrawerContent={ () => {
					return <SideBar
								onNavigate={ subj => {
									setSideOpen(false);
									navigation.navigate('Edit', {subj});
								} }
								onArchivate={ () => {
									setSideOpen(false);
									archivate();
									reset();
								} }
								onReset={ () => {
									setSideOpen(false);
									reset();
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
						disabled={ !company || !position || !shortPosition
									|| skillsCount[0] < MIN_COVER_LETTER_SKILLS
									|| skillsCount[1] < MIN_RESUME_SKILLS
						}
					/>
				</View>
				<Text style={styles.label}>Company</Text>
				<TextInput
					style={styles.input}
					value={company}
					placeholder={'Company Name'}
					onChangeText={ txt => setCompany(txt) } />

				<View style={[styles.row, { justifyContent: 'flex-end' }]}>
					<Text>Is recruiter</Text>
					<Switch
						value={isRecruiter}
						onValueChange={ val => setIsRecruiter(val) } />
				</View>

				<Text style={styles.label}>Position</Text>
				<TextInput
					style={styles.input}
					value={position}
					placeholder={'Position'}
					onChangeText={ txt => setPosition(txt) } />

				<View style={styles.row}>
					<Text>Short:</Text>
					<TextInput
						style={{ flexGrow: 1, borderColor: 'blue', borderWidth: 2, borderRadius: 4, marginHorizontal: 8 }}
						value={shortPosition}
						onChangeText={ txt => setShortPosition(txt) } />
					<Button
						title="cp"
						onPress={ () => setShortPosition(position) } />
				</View>

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
							style={ [
								styles.skillsSummaryText,
								skillsCount[0] < MIN_COVER_LETTER_SKILLS ? { color: 'red' } : undefined
							] }>
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
							style={ [
								styles.skillsSummaryText,
								skillsCount[1] < MIN_RESUME_SKILLS ? { color: 'red' } : undefined
							] }>
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

/*******************************************************************************************************/
/*******************************************************************************************************/
/*******************************************************************************************************/
/*******************************************************************************************************/
/*******************************************************************************************************/
const Tab = createBottomTabNavigator();

export function ScreenGenerateTabbed({ navigation, route }) {

	const { skills, cletter } = useContext(EditorContext);

//	const [company, setCompany] = useState('');
//	const [isRecruiter, setIsRecruiter] = useState(true);
//	const [position, setPosition] = useState('');
//	const [shortPosition, setShortPosition] = useState('');
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
			const fileMetaPath = RNFS.ExternalStorageDirectoryPath + APP_DIR_PATH + 'meta.txt';
			await RNFS.writeFile(
				fileMetaPath,
				position + '\n' + company + '\n' + genTimestamp(),
				'utf8'
			);

			const coverLetter = await RNHTMLtoPDF.convert({
				html: generateCoverLetter({
					pattern: cletter,
					position,
					shortPosition,
					company,
					isRecruiter,
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
					shortPosition,
					skills: Object.values(switches).flatMap( sect => Object.entries(sect).filter(([key, [cl,res]]) => res).map(([key, val]) => key) )
				}),
				fileName: 'Resume',
				directory: 'Applicator'
			});

			const fileCLetterTxtPath = RNFS.ExternalStorageDirectoryPath + APP_DIR_PATH + 'CoverLetter.txt';
			await RNFS.writeFile(
				fileCLetterTxtPath,
				genCoverLetterTxt({
					pattern: cletter,
					position,
					shortPosition,
					company,
					isRecruiter,
					skills: Object.values(switches).flatMap( sect => Object.entries(sect).filter(([key, [cl,res]]) => cl).map(([key, val]) => key) )
				}),
				'utf8'
			);

			Alert.alert('Generated PDF', `Saved at\n\n${coverLetter.filePath}\n\n${resume.filePath}\n\n${fileCLetterTxtPath}`);
		} catch(err) {
			Alert.alert('ERROR', err.message);
		}
	}

	function reset() {
		setCompany('');
		setIsRecruiter(true);
		setPosition('');
		setShortPosition('');

		setSwitches(
			Object.fromEntries(
				Object.entries(switches).map(
					([key, val]) => [
						key,
						Object.fromEntries(
							Object.keys(val).map( k => [k, [false, false]] )
						)
					]
				)
			)
		);
		setSkillsCount([0,0]);
	}

	return (
		<Drawer
				open={sideOpen}
				onOpen={ () => setSideOpen(true) }
				onClose={ () => setSideOpen(false) }
				renderDrawerContent={ () => {
					return <SideBar
								onNavigate={ subj => {
									setSideOpen(false);
									navigation.navigate('Edit', {subj});
								} }
								onArchivate={ () => {
									setSideOpen(false);
									archivate();
									reset();
								} }
								onReset={ () => {
									setSideOpen(false);
									reset();
								} } />;
				} }
			//	drawerStyle={styles.side}
				swipeEdgeWidth={60}
				swipeMinInstance={20}
			>
			<GeneratorDataProvider>
				<Tab.Navigator>
					<Tab.Screen name='A' component={A} />
					<Tab.Screen name='B' component={B} />
				</Tab.Navigator>
			</GeneratorDataProvider>
		</Drawer>
	);
}

function A() {
	const data = useGeneratorData();
	const dispatch = useGeneratorDispatch();

	return (
		<View>
			<Text style={styles.label}>Company</Text>
			<TextInput
				style={styles.input}
				value={data.company}
				placeholder={'Company Name'}
				onChangeText={ text => dispatch({ type: 'company', text }) } />

			<View style={[styles.row, { justifyContent: 'flex-end' }]}>
				<Text>Is recruiter</Text>
				<Switch
					value={data.isRecruiter}
					onValueChange={ val => dispatch({ type: 'recruiter', is: val }) } />
			</View>

			<Text style={styles.label}>Position</Text>
			<TextInput
				style={styles.input}
				value={data.position}
				placeholder={'Position'}
				onChangeText={ text => dispatch({ type: 'position', text }) } />

			<View style={styles.row}>
				<Text>Short:</Text>
				<TextInput
					style={{ flexGrow: 1, borderColor: 'blue', borderWidth: 2, borderRadius: 4, marginHorizontal: 8 }}
					value={data.shortPosition}
					onChangeText={ text => dispatch({ type: 'shortpos', text }) } />
				<Button
					title="cp"
					onPress={ () => dispatch({ type: 'shortpos', text: null }) } />
			</View>
		</View>
	);
}

function B() {
	return (
		<View>
			<Text>BBBBBBBBBBBB</Text>
		</View>
	);
}

/*
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
						disabled={ !company || !position || !shortPosition
									|| skillsCount[0] < MIN_COVER_LETTER_SKILLS
									|| skillsCount[1] < MIN_RESUME_SKILLS
						}
					/>
				</View>








				
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
							style={ [
								styles.skillsSummaryText,
								skillsCount[0] < MIN_COVER_LETTER_SKILLS ? { color: 'red' } : undefined
							] }>
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
							style={ [
								styles.skillsSummaryText,
								skillsCount[1] < MIN_RESUME_SKILLS ? { color: 'red' } : undefined
							] }>
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
*/


/*******************************************************************************************************/
/*******************************************************************************************************/
/*******************************************************************************************************/
/*******************************************************************************************************/

async function archivate() {
	let pos = 'Position';
	let cny = 'Company';
	let tms = genTimestamp();

	const appDirPath = RNFS.ExternalStorageDirectoryPath + APP_DIR_PATH;

	try {
		const content = await RNFS.readFile(appDirPath + 'meta.txt');
		[pos, cny, tms] = content.split('\n');
	} catch (err) {
		console.log('ERROR reading metadata', err.message);
	}

	const archivePath = RNFS.ExternalStorageDirectoryPath + ARCHIVE_PATH + tms + '/';

	try {
		await RNFS.mkdir(archivePath);

		try { await RNFS.moveFile(appDirPath + 'Resume.pdf', archivePath + 'Resume.pdf'); }
		catch (err) { console.log('ERROR moving Resume.pdf', err.message); }

		try { await RNFS.moveFile(appDirPath + 'CoverLetter.pdf', archivePath + 'CoverLetter.pdf'); }
		catch (err) { console.log('ERROR moving CoverLetter.pdf', err.message); }

		try { await RNFS.moveFile(appDirPath + 'CoverLetter.txt', archivePath + 'CoverLetter.txt'); }
		catch (err) { console.log('ERROR moving CoverLetter.txt', err.message); }

		try { await RNFS.moveFile(appDirPath + 'meta.txt', archivePath + `${pos}_@_${cny}.txt`); }
		catch (err) { console.log('ERROR moving meta.txt', err.message); }
	} catch (err) {
		console.log('ERROR making archive subdir', err.message);
	}
}


function SideBar({ onNavigate, onArchivate, onReset }) {
	return	<View style={styles.side}>
				<ActButton label="Reset" onPress={ () => onReset() } />
				<ActButton label="Archivate" onPress={ () => onArchivate() } />

				<View style={{ height: 0, borderWidth:0.5, borderColor: 'grey', width: '75%', marginVertical: 30 }} />

				<NaviButton label='Skills' onPress={ () => onNavigate('skills') } />
				<NaviButton label='Cover Letter' onPress={ () => onNavigate('cletter') } />
				<NaviButton label='Resume' onPress={ () => onNavigate('resume') } />
			</View>;
}

function NaviButton({ label, onPress }) {
	return (
		<Pressable
			style={[ styles.sideButton, { display: 'flex', flexDirection: 'row', justifyContent: 'center' } ]}
			onPress={onPress}
		>
			<Text>img</Text>
			<Text>{label}</Text>
		</Pressable>
	);
}

function ActButton({ label, onPress }) {
	return (
		<Pressable
			style={styles.sideButton}
			onPress={onPress}
		>
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
		height: '100%',
		//padding: 8
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
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 8
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
		height: '100%',
	//	width: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	},
	sideButton: {
		borderColor: 'navy',
		borderWidth: 2,
		borderRadius: 6,
		width: '90%',
	//	height: 60,
		padding: 8,
		marginVertical: 16
	}
});

/**********************************************************************************************************\
 *
 *
\**********************************************************************************************************/
function genTimestamp() {
	const expand = x => x < 10 ? '0' + x : x;

	const now = new Date();

	const year = now.getFullYear();
	const month = expand(now.getMonth() + 1);
	const day = expand(now.getDate());
	const hour = expand(now.getHours());
	const min = expand(now.getMinutes());
	const sec = expand(now.getSeconds());

	return `${year}${month}${day}_${hour}${min}${sec}`;
}

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



//**************************************************************************/
//**************************************************************************/
//**************************************************************************/
//**************************************************************************/
function genCoverLetterTxt({ pattern, position, shortPosition, company, isRecruiter, skills }) {
	return pattern.replace(/%%([A-Z_]+)%%/g, (match, p1, offset, string) => {
		switch (p1) {
		case 'POSITION':		return position;
		case 'COMPANY':			return company;
		case 'POSITION_SHORT':	return shortPosition;
		case 'COMPANY_SELF':	return isRecruiter ? 'company' : company;
		case 'SKILLS':			return skills.join(', ');
		default:				return '';
		}
	});
}


//**************************************************************************/
//**************************************************************************/
//**************************************************************************/
//**************************************************************************/
function generateCoverLetter({ pattern, position, shortPosition, company, isRecruiter, date, skills }) {

	const substitution = pattern
		//.trim()
		.split(/\s*\n+\s*/)
		.filter(p => p)
		.map( p => {		//console.log(p);
			if (p === '%%SKILLS%%') {
				return `<ul>${skills.map(li => '<li>' + li + '</li>').join('')}</ul>`;
			}

			return `<p>${p.replace( /%%([A-Z_]+)%%/g, (match, p1, offset, string) => {
				switch (p1) {
				case 'POSITION':		return position;
				case 'COMPANY':			return company;
				case 'POSITION_SHORT':	return shortPosition;
				case 'COMPANY_SELF':	return isRecruiter ? 'company' : company;

				default:				return '';
				}
			} )}</p>`;
		} )
		.join('');


	return `<html>
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
		ul {
			columns: ${skills.length > MAX_SKILLS_SINGLE_COLUMN_CLETTER ? 2 : 1};
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

	${substitution}

	<p>Sincerely,</p>
	<p>${persconf.name}</p>
</body>
</html>`;
}


//**************************************************************************/
//**************************************************************************/
//**************************************************************************/
//**************************************************************************/
function generateResume({ position, shortPosition, skills, certificates }) {
	return `
<html>
<head>
	<style>
		body {
			width: 8.5in;
			height: 11in;
			/*padding: 0.79in;*/
		}
		h1,p.hdr {
			margin: 0;
		}
		p.pos {
			font-size: 1.5em;
			margin-bottom: 0.5em;
		}
		ul.skill {
			columns: ${skills.length > MAX_SKILLS_SINGLE_COLUMN_RESUME ? 2 : 1};
		}
		ul li {
			margin-top: 0.3em;
		}
		ul.exp li {
			margin-top: 0.7em;
		}
		@page {
			margin: 0.79in;
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

	<p>Enthusiastic, dependable, motivated ${shortPosition} with strong practical
	background and great passion to coding. Spent 15+ years learning computer science,
	high- and low-level programming languages, frameworks, platforms,
	computer-related technologies, interfaces, and never stop developing, even when sleeping.
	Eager to direct my skills and passion to meet business needs.</p>

	<h2>Education</h2>

	<ul>Belarusian State Medical University
		<li>2005 – 2011</li>
	</ul>

	<ul class="edu">Self education based on:
		<li>15+ years of learning, developing, experimenting, investigating computer technologies</li>
    	<li>1,000s hours of coding, debugging, fixing errors, resolving compiling problems</li>
    	<li>1,000,000s lines of code in C++, Java, HTML, JavaScript, CSS, XML, Perl</li>
    	<li>Great practical experience developing for Windows, Linux, Android, ARM, Web</li>
    </ul>

	<h2>Experience</h2>
	<ul class="exp">
		<li>Android organizer application by my friend physician's request that assists him in logging his working performance
		(Room Library, custom RecyclerView LayoutManager, custom View)</li>

		<li>Custom STM32 library written in C++: RCC, GPIO, UART, I2C, SPI, USB</li>

		<li>Electronic drum kit (Arduino, UART, C++, MIDI)</li>

		<li>Twister game referee with build-in music player (Borland C++ Builder, DirectSound API)</li>

		<li>Telegram Bots (Telegram Bot API, AWS Lambda)</li>
	</ul>

	<h2>Skills</h2>
	<ul class="skill">
		${skills.map( li => '<li>' + li + '</li>' ).join('')}
	</ul>

	<h2>Languages</h2>
	<ul>
		<li>English</li>
		<li>Belarusian</li>
		<li>Russian</li>
		<li>Polish</li>
    </ul>
</body>
</html>
	`;
}
