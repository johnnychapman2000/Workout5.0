/* ========================================
   CHALLENGE SYSTEM
   ======================================== */

const CHALLENGES = [

	{
		id:'workout10',
		name:'10 Workout Days',
		type:'WorkoutDays',
		target:10
	},

	{
		id:'workout25',
		name:'25 Workout Days',
		type:'WorkoutDays',
		target:25
	},

	{
		id:'steps100k',
		name:'100,000 Steps',
		type:'Steps',
		target:100000
	},

	{
		id:'volume50k',
		name:'50,000 lbs Lifted',
		type:'Volume',
		target:50000
	}

];

let CHALLENGE_DATA = [];

async function loadChallengeData(){

	CHALLENGE_DATA =
		await (
			await fetch(
				API + '?action=getWorkoutHistory'
			)
		).json();
}

function calculateChallengeProgress(){

	let totalVolume = 0;

	const days = new Set();

	CHALLENGE_DATA.forEach(x => {

		totalVolume +=
			Number(x.Volume || 0);

		days.add(
			String(x.WorkoutDate)
				.substring(0,10)
		);
	});

	return CHALLENGES.map(c => {

		let progress = 0;

		if(c.type === 'WorkoutDays'){
			progress = days.size;
		}

		if(c.type === 'Volume'){
			progress = totalVolume;
		}

		return {

			...c,

			progress,

			percent:
				Math.min(
					100,
					Math.round(
						(progress / c.target) * 100
					)
				),

			completed:
				progress >= c.target
		};
	});
}