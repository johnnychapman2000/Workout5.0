/* ========================================
   WORKOUT 6.0 CACHE SYSTEM
   ======================================== */

/* ========================================
   SAVE CACHE
   ======================================== */

function saveCache(key,data){

	const cacheObject = {
		timestamp:Date.now(),
		data:data
	};

	localStorage.setItem(
		key,
		JSON.stringify(cacheObject)
	);
}

/* ========================================
   LOAD CACHE
   ======================================== */

function loadCache(key){

	try{

		const cached =
			localStorage.getItem(key);

		if(!cached){
			return null;
		}

		return JSON.parse(cached);

	}
	catch(err){

		console.error(
			'Cache load failed:',
			key,
			err
		);

		return null;
	}
}

/* ========================================
   CLEAR CACHE
   ======================================== */

function clearCache(key){

	localStorage.removeItem(key);
}

/* ========================================
   CLEAR ALL WORKOUT CACHE
   ======================================== */

function clearAllCache(){

	Object.keys(localStorage)
		.filter(key =>
			key.startsWith('w6_')
		)
		.forEach(key => {

			localStorage.removeItem(
				key
			);

		});
}

/* ========================================
   CACHE EXISTS
   ======================================== */

function cacheExists(key){

	return (
		localStorage.getItem(key) !== null
	);
}

/* ========================================
   CACHE AGE
   ======================================== */

function getCacheAgeMinutes(key){

	const cached =
		loadCache(key);

	if(!cached){
		return null;
	}

	return Math.floor(
		(
			Date.now() -
			cached.timestamp
		) / 60000
	);
}

/* ========================================
   PROFILE CACHE KEYS
   ======================================== */

function getProfileCacheKey(
	baseKey,
	userCode
){

	userCode =
		String(
			userCode || 'IRONWOLF'
		)
		.trim()
		.toUpperCase();

	return (
		baseKey +
		'_' +
		userCode
	);
}

/* ========================================
   CACHE KEYS
   ======================================== */

const CACHE_KEYS = {

	EXERCISE_MASTER:
		'w6_exercise_master',

	WORKOUT_PLANS:
		'w6_workout_plans',

	SETTINGS:
		'w6_settings',

	CURRENT_WORKOUT:
		'w6_current_workout',

	CURRENT_WORKOUT_DETAILS:
		'w6_current_workout_details',

	CURRENT_WORKOUT_PROGRESS:
		'w6_workout_progress',

	WORKOUT_HISTORY:
		'w6_workout_history',

	RECENT_WORKOUTS:
		'w6_recent_workouts',

	VOLUME_HISTORY:
		'w6_volume_history',

	BATTLE_LINES:
		'w6_battle_lines',

	LEAD_CHASE:
		'w6_lead_chase',

	WORKOUT_WIRE:
		'w6_workout_wire'
};

/* ========================================
   GET CACHED DATA
   ======================================== */

async function getCachedData(
	key,
	fetchFunction,
	maxAgeMinutes
){

	const cached =
		loadCache(key);

	if(cached){

		const ageMinutes =
			(
				Date.now() -
				cached.timestamp
			) / 60000;

		if(ageMinutes < maxAgeMinutes){

			console.log(
				'CACHE HIT:',
				key
			);

			return cached.data;
		}

		console.log(
			'CACHE EXPIRED:',
			key
		);
	}

	console.log(
		'CACHE MISS:',
		key
	);

	const freshData =
		await fetchFunction();

	saveCache(
		key,
		freshData
	);

	return freshData;
}

/* ========================================
   CACHE REFRESH
   ======================================== */

async function refreshCache(
	key,
	fetchFunction
){

	console.log(
		'CACHE REFRESH:',
		key
	);

	const freshData =
		await fetchFunction();

	saveCache(
		key,
		freshData
	);

	return freshData;
}