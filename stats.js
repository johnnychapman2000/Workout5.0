/* ========================================
   STATS PAGE LOGIC
   ======================================== */

let all = [];

document.addEventListener("DOMContentLoaded", () => {
	initializeStats();
});

async function initializeStats(){

	document.getElementById('navigation').innerHTML =
		buildNavigation('stats');

all = await (
	await fetch(
		API +
		'?action=getWorkoutHistory' +
		'&user=' +
		getUserCode()
	)
).json();

	render('daily');
}

function setPeriod(p){

	d.classList.remove('active');
	m.classList.remove('active');
	y.classList.remove('active');

	if(p === 'daily'){
		d.classList.add('active');
	}

	if(p === 'monthly'){
		m.classList.add('active');
	}

	if(p === 'yearly'){
		y.classList.add('active');
	}

	render(p);
}

function render(period){

	let data = [...all];

	const now = new Date();

	data = data.filter(x => {

		const dt =
			new Date(
				x.WorkoutDate || x.Timestamp
			);

		if(period === 'daily'){

			const today =
				new Date()
					.toLocaleDateString('sv-SE');

			return (
				String(x.WorkoutDate)
					.substring(0,10) === today
			);
		}

		if(period === 'monthly'){

			return (
				dt.getMonth() === now.getMonth() &&
				dt.getFullYear() === now.getFullYear()
			);
		}

		return (
			dt.getFullYear() === now.getFullYear()
		);
	});

	let vol = 0;
	let max = 0;
	let top = 'None';

	data.forEach(x => {

		const v =
			Number(x.Volume || 0);

		vol += v;

		if(v > max){

			max = v;

			top =
				x.ExerciseName ||
				'Unknown';
		}
	});

	const days = new Set(
		data.map(
			x => String(x.WorkoutDate)
				.substring(0,10)
		)
	).size;

	tv.innerText =
		vol.toLocaleString() + ' lbs';

	ec.innerText =
		data.length;

	wd.innerText =
		days;

	av.innerText =
		(
			data.length
				? Math.round(vol / data.length)
				: 0
		).toLocaleString() + ' lbs';

	te.innerText =
		top +
		' (' +
		max.toLocaleString() +
		' lbs)';
}