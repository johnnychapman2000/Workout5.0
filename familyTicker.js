/* ========================================
   FAMILY STATUS TICKER
   ======================================== */

const MESSAGE_BANK = {

	alert: [
		{
			headline:'ALERT!!!!',
			text:'THIS JUST IN!!! {USER} just completed {VOLUME} lbs on {EXERCISE}. The family leaderboard has been warned.'
		},
		{
			headline:'ALERT!!!!',
			text:'BREAKING NEWS!!! {USER} just logged {EXERCISE} for {VOLUME} lbs. Things are getting interesting.'
		},
		{
			headline:'ALERT!!!!',
			text:'THIS JUST IN!!! {USER} just made noise with {EXERCISE}. The scoreboard is paying attention.'
		},
		{
			headline:'ALERT!!!!',
			text:'{USER} just added {VOLUME} lbs on {EXERCISE}. Workout Wire is watching.'
		}
	],

leader: [
{
  headline:'AREA LEADER',
  text:'{USER} leads {AREA} by {DIFFERENCE}.'
},
{
  headline:'LEADERBOARD',
  text:'{AREA}: {USER} remains ahead of {RIVAL} by {DIFFERENCE}.'
},
{
  headline:'MONTHLY STANDINGS',
  text:'{USER} holds the top spot in {AREA}. Gap: {DIFFERENCE}.'
},
{
  headline:'AREA CONTROL',
  text:'{USER} currently controls {AREA} with a {DIFFERENCE} lead.'
}
],

	biglift: [
		{
			headline:'BIG LIFT',
			text:'{USER} just logged {VOLUME} lbs on {EXERCISE}. The scoreboard felt that one.'
		},
		{
			headline:'BIG LIFT',
			text:'{USER} just dropped {VOLUME} lbs on {EXERCISE}. That was not a quiet workout.'
		},
		{
			headline:'BIG LIFT',
			text:'{USER} added serious volume with {EXERCISE}. The gym ledger has been updated.'
		},
		{
			headline:'BIG LIFT',
			text:'{USER} crushed {EXERCISE} for {VOLUME} lbs. The Workout Wire noticed.'
		},
		{
			headline:'BIG LIFT',
			text:'{USER} put up {VOLUME} lbs on {EXERCISE}. That one deserves attention.'
		}
	],

	body: [
		{
			headline:'BODY MODE',
			text:'{USER} is putting in bodyweight work with {EXERCISE}. Every rep counts.'
		},
		{
			headline:'BODY MODE',
			text:'{USER} just knocked out {EXERCISE}. Core strength is being built the hard way.'
		},
		{
			headline:'BODY MODE',
			text:'{USER} is stacking bodyweight reps with {EXERCISE}. No shortcuts detected.'
		},
		{
			headline:'BODY MODE',
			text:'{USER} just added another bodyweight session with {EXERCISE}.'
		}
	],

	cardio: [
		{
			headline:'CARDIO WATCH',
			text:'{USER} just logged cardio work with {EXERCISE}. Endurance points are on the board.'
		},
		{
			headline:'CARDIO WATCH',
			text:'{USER} is putting distance between themselves and the couch with {EXERCISE}.'
		},
		{
			headline:'CARDIO WATCH',
			text:'{USER} just added another cardio session through {EXERCISE}.'
		},
		{
			headline:'CARDIO WATCH',
			text:'The cardio meter moved today. {USER} logged {EXERCISE}.'
		}
	],
activity: [

	{
		headline:'In Case you missed it',
		text:'{USER} logged {EXERCISE} in {AREA}.'
	},

	{
		headline:'WORKOUT UPDATE',
		text:'{USER} completed {EXERCISE}. The training log grows.'
	},

	{
		headline:'TRAINING LOG',
		text:'{USER} added work to {AREA} with {EXERCISE}.'
	},

	{
		headline:'Recent Activity',
		text:'{USER} checked in with {EXERCISE}. Progress continues.'
	}

],

battle: [
{
  headline:'BATTLE LINES',
  text:'{AREA}: {USER} leads {RIVAL} by {DIFFERENCE}.'
},
{
  headline:'MONTHLY WAR',
  text:'The {AREA} battle remains active. Gap: {DIFFERENCE}.'
},
{
  headline:'LIVE SCORE',
  text:'{AREA} standings: {USER} ahead by {DIFFERENCE}.'
},
{
  headline:'FRONT LINE',
  text:'{USER} is defending a {DIFFERENCE} lead in {AREA}.'
}
],


	closing: [
		{
			headline:'CLOSING THE GAP',
			text:'{USER} is closing the gap on {RIVAL}. Only {DIFFERENCE} lbs separate them in {AREA}.'
		},
		{
			headline:'CLOSING THE GAP',
			text:'{USER} is making a move in {AREA}. {RIVAL} still leads, but the gap is shrinking.'
		},
		{
			headline:'CLOSING THE GAP',
			text:'{USER} is creeping up in {AREA}. {RIVAL} might want to keep moving.'
		},
		{
			headline:'CLOSING THE GAP',
			text:'The {AREA} race is getting tighter. {USER} is only {DIFFERENCE} lbs behind {RIVAL}.'
		}
	],

	bad: [
		{
			headline:'WAKE UP',
			text:'{USER} is falling behind this month in {AREA}. The dumbbells are starting to ask questions.'
		},
		{
			headline:'WAKE UP',
			text:'{USER} has some catching up to do in {AREA}. The leaderboard is not impressed.'
		},
		{
			headline:'WAKE UP',
			text:'{USER} is behind pace in {AREA}. Time to stop negotiating with gravity.'
		},
		{
			headline:'WAKE UP',
			text:'The {AREA} numbers are slipping for {USER}. Time to answer the bell.'
		}
	],

	overtaken: [
		{
			headline:'OVERTAKEN',
			text:'{USER} just lost the monthly {AREA} lead. {RIVAL} is now ahead by {DIFFERENCE} lbs.'
		},
		{
			headline:'OVERTAKEN',
			text:'{USER} got bumped from the top spot in {AREA}. {RIVAL} has taken control.'
		},
		{
			headline:'LEAD LOST',
			text:'The {AREA} leaderboard just changed. {USER} has been overtaken by {RIVAL}.'
		},
		{
			headline:'LEAD LOST',
			text:'{RIVAL} has moved ahead in {AREA}. {USER} is now chasing by {DIFFERENCE} lbs.'
		}
	]
};
let FAMILY_TICKER_EVENTS = [];
let tickerSlideIndex = 0;

/* ========================================
   INIT
   ======================================== */

document.addEventListener(
	'DOMContentLoaded',
	() => {

		startFamilyTicker();

	}
);

/* ========================================
   START TICKER
   ======================================== */

async function startFamilyTicker(){

	await loadFamilyTickerEvents();

	if(!FAMILY_TICKER_EVENTS.length){

		showEmptyTickerMessage();

		return;
	}

	showSlideTickerMessage(
		tickerSlideIndex
	);

	setInterval(() => {

		tickerSlideIndex =
			nextTickerIndex(
				tickerSlideIndex
			);

		showSlideTickerMessage(
			tickerSlideIndex
		);

	},12000);
}

/* ========================================
   LOAD REAL TICKER EVENTS
   ======================================== */

async function loadFamilyTickerEvents(){

	try{

const data =
	await (
		await fetch(
			API +
			'?action=getFamilyTickerEvents' +
			'&user=' +
			getUserCode() +
			'&t=' +
			Date.now()
		)
	).json();

		FAMILY_TICKER_EVENTS =
			data.map(x => {

				const type =
					x.type || 'alert';

				return {
					type:type,
					icon:getTickerIcon(
						type
					),
					user:x.UserCode || 'UNKNOWN',
					rival:x.RivalUserCode || 'the family',
					exercise:x.ExerciseName || 'a workout',
					area:x.WorkoutArea || x.PlanName || 'workouts',
					volume:Number(
						x.Volume || 0
					).toLocaleString(),
					difference:Number(
						x.Difference || 0
					).toLocaleString()
				};

			});

		console.log(
			'Family Ticker Events:',
			FAMILY_TICKER_EVENTS
		);

	}
	catch(err){

		console.error(
			'Family ticker load failed:',
			err
		);

		FAMILY_TICKER_EVENTS = [];
	}
}

/* ========================================
   EMPTY STATE
   ======================================== */

function showEmptyTickerMessage(){

	const headline =
		document.getElementById(
			'tickerSlideHeadline'
		);

	const detail =
		document.getElementById(
			'tickerSlideDetail'
		);

	if(
		!headline ||
		!detail
	){
		return;
	}

	headline.innerText =
		'📡 WORKOUT WIRE';

	detail.innerText =
		'No family workout updates yet. The leaderboard is waiting.';
}

/* ========================================
   SLIDE TICKER
   ======================================== */

function showSlideTickerMessage(index){

	const headline =
		document.getElementById(
			'tickerSlideHeadline'
		);

	const detail =
		document.getElementById(
			'tickerSlideDetail'
		);

	if(
		!headline ||
		!detail
	){
		return;
	}

	const card =
		detail.closest(
			'.ticker-card'
		);

	const event =
		FAMILY_TICKER_EVENTS[index];

	const message =
		buildTickerMessage(
			event
		);

	resetTickerCardClass(
		card
	);

	card.classList.add(
		'ticker-' + event.type
	);

	headline.innerText =
		event.icon +
		' ' +
		message.headline;

	detail.style.animation = 'none';

	void detail.offsetWidth;

	detail.innerText =
		message.text;

	detail.style.animation = '';

	applyTickerEffect(
		card,
		event.type
	);
}

/* ========================================
   MESSAGE BUILDER
   ======================================== */

function buildTickerMessage(event){

	const templates =
		MESSAGE_BANK[event.type] ||
		MESSAGE_BANK.alert;

	const selected =
		templates[
			getRandomIndex(
				templates.length
			)
		];

	return {
		headline:selected.headline,
		text:fillTickerTemplate(
			selected.text,
			event
		)
	};
}

function fillTickerTemplate(text,event){

	return text
		.replaceAll(
			'{USER}',
			event.user
		)
		.replaceAll(
			'{RIVAL}',
			event.rival
		)
		.replaceAll(
			'{EXERCISE}',
			event.exercise
		)
		.replaceAll(
			'{AREA}',
			event.area
		)
		.replaceAll(
			'{VOLUME}',
			event.volume
		)
		.replaceAll(
			'{DIFFERENCE}',
			event.difference
		);
}

function getRandomIndex(max){

	return Math.floor(
		Math.random() * max
	);
}

function getTickerIcon(type){

	if(type === 'leader'){
		return '🏆';
	}

	if(type === 'biglift'){
		return '🔥';
	}

	if(type === 'closing'){
		return '📈';
	}

	if(type === 'battle'){
		return '⚔️';
	}

	if(type === 'body'){
		return '💪';
	}

	if(type === 'cardio'){
		return '🏃';
	}

	if(type === 'bad'){
		return '💥';
	}

	if(type === 'overtaken'){
		return '💀';
	}
	if(type === 'activity'){
		return '🏋️';
	}

	return '🚨';
}

/* ========================================
   EFFECT ROUTER
   ======================================== */

function applyTickerEffect(card,type){

	if(type === 'alert'){

		triggerAlertBlast(
			card
		);

		triggerSlamIn(
			card
		);
	}

	if(type === 'leader'){

		triggerLeaderBurst(
			card
		);

		triggerBounceOut(
			card
		);
	}

	if(type === 'biglift'){

		triggerFirePulse(
			card
		);
	}

	if(type === 'closing'){

		triggerClosingSweep(
			card
		);

		triggerWobble(
			card
		);
	}

	if(type === 'bad'){

		triggerCardShake(
			card
		);
	}

	if(type === 'overtaken'){

		triggerCardDrop(
			card
		);
	}
if(type === 'battle'){

	triggerLeaderBurst(
		card
	);

	triggerWobble(
		card
	);
}

if(type === 'body'){

	triggerBounceOut(
		card
	);
}

if(type === 'cardio'){

	triggerFirePulse(
		card
	);
}
}

/* ========================================
   CLASS RESET
   ======================================== */

function resetTickerCardClass(card){

	if(!card){
		return;
	}

	card.classList.remove(
	'ticker-alert',
	'ticker-leader',
	'ticker-biglift',
	'ticker-closing',
	'ticker-bad',
	'ticker-overtaken',
	'ticker-activity',
	'ticker-battle',
	'ticker-body',
	'ticker-cardio',
	'ticker-trophy-bounce',
	'ticker-alert-blast',
	'ticker-card-shake',
	'ticker-alert-icon',
	'ticker-leader-burst',
	'ticker-fire-pulse',
	'ticker-fire-icon',
	'ticker-sweep',
	'ticker-closing-icon',
	'ticker-bad-icon',
	'ticker-card-bounce-out',
	'ticker-card-slam',
	'ticker-card-wobble',
	'ticker-card-drop',
	'ticker-active-effect'
	);
}

/* ========================================
   EFFECT HELPERS
   ======================================== */

function triggerAlertBlast(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-alert-blast',
		'ticker-alert-icon'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-alert-blast',
		'ticker-alert-icon'
	);
}

function triggerLeaderBurst(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-leader-burst',
		'ticker-trophy-bounce'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-leader-burst',
		'ticker-trophy-bounce'
	);
}

function triggerFirePulse(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-fire-pulse',
		'ticker-fire-icon'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-fire-pulse',
		'ticker-fire-icon'
	);
}

function triggerClosingSweep(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-sweep',
		'ticker-closing-icon'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-sweep',
		'ticker-closing-icon'
	);
}

function triggerCardShake(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-card-shake',
		'ticker-bad-icon'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-card-shake',
		'ticker-bad-icon'
	);
}

function triggerBounceOut(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-card-bounce-out'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-card-bounce-out'
	);
}

function triggerSlamIn(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-card-slam'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-card-slam'
	);
}

function triggerWobble(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-card-wobble'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-card-wobble'
	);
}

function triggerCardDrop(card){

	if(!card){
		return;
	}

	card.classList.remove(
		'ticker-card-drop'
	);

	void card.offsetWidth;

	card.classList.add(
		'ticker-card-drop'
	);
}

/* ========================================
   INDEX HELPER
   ======================================== */

function nextTickerIndex(index){

	index++;

	if(index >= FAMILY_TICKER_EVENTS.length){
		index = 0;
	}

	return index;
}