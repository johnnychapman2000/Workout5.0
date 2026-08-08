/* ========================================
   PROFILE CONFIG
   ======================================== */

const PROFILES = {

	IRONWOLF: {
		code: 'IRONWOLF',
		name: 'John',
		color: '#FF9800',
		icon: '🐺'
	},

	BLACKRAVEN: {
		code: 'BLACKRAVEN',
		name: 'Daughter',
		color: '#1E293B',
		icon: '🦅'
	},

	TITAN: {
		code: 'TITAN',
		name: 'Son',
		color: '#4CAF50',
		icon: '⚔️'
	}

};

/* ========================================
   PROFILE RESOLUTION
   ======================================== */

const PROFILE_PARAMS =
	new URLSearchParams(
		window.location.search
	);

let USER_CODE =
	PROFILE_PARAMS.get('user');

/* Fallback To Stored Profile */

if(!USER_CODE){

	USER_CODE =
		localStorage.getItem(
			'WorkoutProfile'
		);
}

/* Normalize */

USER_CODE =
	String(
		USER_CODE || ''
	).toUpperCase();

/* Final Fallback */

if(
	!USER_CODE ||
	!PROFILES[USER_CODE]
){

	USER_CODE = 'IRONWOLF';
}

/* Save For Future Visits */

localStorage.setItem(
	'WorkoutProfile',
	USER_CODE
);

const CURRENT_PROFILE =
	PROFILES[USER_CODE];

/* ========================================
   PUBLIC HELPERS
   ======================================== */

function getUserCode(){

	return USER_CODE;
}

function getCurrentProfile(){

	return CURRENT_PROFILE;
}

function getProfileName(){

	return CURRENT_PROFILE.name;
}

function getProfileIcon(){

	return CURRENT_PROFILE.icon;
}

function getProfileColor(){

	return CURRENT_PROFILE.color;
}

function getProfileDisplayName(){

	return (
		CURRENT_PROFILE.icon +
		' ' +
		CURRENT_PROFILE.name
	);
}
function getProfileQuery(){

	return (
		'user=' +
		getUserCode()
	);
}

/* ========================================
   URL HELPERS
   ======================================== */

function buildProfileUrl(page){

	return (
		page +
		'?user=' +
		getUserCode()
	);
}

function navigateToProfilePage(page){

	window.location.href =
		buildProfileUrl(page);
}

/* ========================================
   PROFILE THEME
   ======================================== */

function applyProfileTheme(){

	document.documentElement.style.setProperty(
		'--profile-color',
		CURRENT_PROFILE.color
	);
}

/* ========================================
   DEBUG
   ======================================== */

const PROFILE_DEBUG = true;

if(PROFILE_DEBUG){

	console.log(
		'Workout Profile:',
		CURRENT_PROFILE.code
	);

	console.log(
		'Profile Name:',
		CURRENT_PROFILE.name
	);

	console.log(
		'Profile Icon:',
		CURRENT_PROFILE.icon
	);

	console.log(
		'Profile Color:',
		CURRENT_PROFILE.color
	);
}