/* ========================================
   IMPROVEMENT TRACKER
   ======================================== */

let IMPROVEMENT_DATA = [];

async function loadImprovementData(){

	IMPROVEMENT_DATA =
		await (
			await fetch(
				API + '?action=getWorkoutHistory'
			)
		).json();
}

function getCurrentMonthStats(){

	const now = new Date();

	return calculateMonthStats(
		now.getMonth(),
		now.getFullYear()
	);
}

function getPreviousMonthStats(){

	const now = new Date();

	let month = now.getMonth() - 1;
	let year = now.getFullYear();

	if(month < 0){
		month = 11;
		year--;
	}

	return calculateMonthStats(
		month,
		year
	);
}

function calculateMonthStats(month, year){

	const data =
		IMPROVEMENT_DATA.filter(x => {

			const d =
				new Date(
					x.WorkoutDate
				);

			return (
				d.getMonth() === month &&
				d.getFullYear() === year
			);
		});

	const volume =
		data.reduce(
			(t,x) =>
				t + Number(x.Volume || 0),
			0
		);

	const workoutDays =
		new Set(
			data.map(
				x => String(x.WorkoutDate)
					.substring(0,10)
			)
		).size;

	return {
		volume,
		workoutDays,
		exercises:data.length
	};
}

function calculateImprovement(){

	const current =
		getCurrentMonthStats();

	const previous =
		getPreviousMonthStats();

	return {

		volumePercent:
			getPercentChange(
				previous.volume,
				current.volume
			),

		workoutDaysChange:
			current.workoutDays -
			previous.workoutDays,

		exerciseChange:
			current.exercises -
			previous.exercises
	};
}

function getPercentChange(oldVal,newVal){

	if(oldVal === 0){
		return 100;
	}

	return Math.round(
		((newVal - oldVal) / oldVal) * 100
	);
}