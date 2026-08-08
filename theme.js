/* ========================================
   THEME CONFIG
   ======================================== */

const THEMES = {

	default: {
		name: 'Default',
		primary: '#ff9800'
	},

	green: {
		name: 'Green',
		primary: '#4caf50'
	},

	blue: {
		name: 'Blue',
		primary: '#2196f3'
	},

	purple: {
		name: 'Purple',
		primary: '#9c27b0'
	},

	red: {
		name: 'Red',
		primary: '#f44336'
	}
};

/* ========================================
   CURRENT THEME
   ======================================== */

let CURRENT_THEME =
	localStorage.getItem('WorkoutTheme') ||
	'default';

applyTheme(CURRENT_THEME);

/* ========================================
   THEME FUNCTIONS
   ======================================== */

function applyTheme(themeKey){

	if(!THEMES[themeKey]){
		themeKey = 'default';
	}

	CURRENT_THEME = themeKey;

	document.documentElement.style.setProperty(
		'--primary-color',
		THEMES[themeKey].primary
	);

	localStorage.setItem(
		'WorkoutTheme',
		themeKey
	);
}

function getCurrentTheme(){

	return CURRENT_THEME;
}

function getThemeConfig(){

	return THEMES[CURRENT_THEME];
}

function getAvailableThemes(){

	return Object.keys(THEMES);
}