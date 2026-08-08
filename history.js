/* ========================================
   HISTORY PAGE LOGIC
   ======================================== */

let HISTORY_ITEMS = [];
let SELECTED_HISTORY = null;

document.addEventListener("DOMContentLoaded", () => {
	initializeHistory();
});

function initializeHistory(){

	document.getElementById('navigation').innerHTML =
		buildNavigation('history');

	loadRecent();
}

function setA(x){

	r.classList.remove('active');
	d.classList.remove('active');
	v.classList.remove('active');

	document
		.getElementById(x)
		.classList.add('active');
}

function openHistoryDetail(item){

	SELECTED_HISTORY = item;

	document.getElementById(
		'historyDetailContent'
	).innerHTML = `
		<div>
			<b>Exercise</b><br>
			${item.ExerciseName}
		</div>

		<br>

		<div>
			<b>Date</b><br>
			${new Date(item.WorkoutDate)
			.toLocaleDateString(
			'en-US',
		{
			month:'short',
			day:'2-digit',
			year:'numeric'
		}
	)}
		</div>

		<br>

<div>
	<b>Results</b><br>
	${
		item.Weight
			? `${item.Sets} × ${item.Reps} × ${item.Weight}`
			: `${item.Sets} × ${item.Reps}`
	}
</div>
	`;

	document.getElementById(
		'deleteHistoryBtn'
	).onclick = () =>
		deleteWorkoutEntry(
			item.Timestamp
		);

	historyDetailModal.style.display =
		'block';
}

function closeHistoryDetail(){

	document.getElementById(
		'historyDetailModal'
	).style.display = 'none';
}

/* ========================================
   GET RECENT HISTORY
   ======================================== */

async function loadRecent(){

	setA('r');

	const data =
		await (
			await fetch(
				API +
				'?action=getRecentWorkouts' +
				'&user=' +
				getUserCode() +
				'&t=' +
				Date.now()
			)
		).json();

	content.innerHTML='';

	HISTORY_ITEMS =
		data
			.filter(
				x => x.ExerciseName !== 'Steps'
			)
			.slice(0,10);

	HISTORY_ITEMS.forEach((x,index) => {

		content.innerHTML += `
			<div
				class="history-activity"
				onclick="openHistoryDetail(HISTORY_ITEMS[${index}])">

				<div class="activity-name">
					${x.ExerciseName || ''}
				</div>

				<div class="activity-result">
					${
						x.Weight
							? `${x.Sets||0}×${x.Reps||0}×${x.Weight}`
							: `${x.Sets||0}×${x.Reps||0}`
					}
				</div>

				<div class="activity-date">
					${new Date(x.WorkoutDate)
						.toLocaleDateString(
							'en-US',
							{
								month:'short',
								day:'2-digit'
							}
						)}
				</div>

			</div>
		`;

	});
}

async function loadDaily(){

	setA('d');

	const data =
		await (
			await fetch(API+'?action=getWorkoutHistory&user='+getUserCode()
			)
		).json();

	const grp = {};

	data.forEach(x => {

		const day =
			String(x.WorkoutDate)
				.substring(0,10);

		if(!grp[day]){
			grp[day] = {
				count:0,
				vol:0
			};
		}

		grp[day].count++;

		grp[day].vol +=
			Number(x.Volume || 0);

	});

	content.innerHTML='';

	Object.keys(grp)
		.sort()
		.reverse()
		.forEach(day =>

			content.innerHTML += `
				<div class="card">

					<div class="history-row">

						<div class="history-name">
							${day}
						</div>

						<div>
							${grp[day].count} exercises
						</div>

					</div>

					<div class="history-muted">
						Volume ${grp[day].vol.toLocaleString()}
					</div>

				</div>
			`
		);
}

async function loadVolume(){

	setA('v');

	const data =
		await (
			await fetch(API+'?action=getVolumeHistory&user='+getUserCode()
			)
		).json();

	const filteredData =
		data.filter(
			x => x.PlanName !== 'Steps'
		);

	content.innerHTML='';

	filteredData.forEach(x =>

		content.innerHTML += `
			<div class="card">

				<div class="history-row">

					<div class="history-name">
						${x.PlanName}
					</div>

					<div>
						${x.ExerciseCount}
					</div>

				</div>

				<div class="history-muted">
					${Number(x.TotalVolume).toLocaleString()} lbs
				</div>

			</div>
		`
	);
}

async function deleteWorkoutEntry(timestamp){

	if(
		!confirm(
			'Delete this workout entry?'
		)
	){
		return;
	}

	const response =
		await fetch(API,{
			method:'POST',
			body:JSON.stringify({
				action:'deleteWorkoutLog',
				Timestamp:timestamp
			})
		});

	const result =
		await response.json();

	if(result.success){

		closeHistoryDetail();

		loadRecent();

	}else{

		alert(result.message);
	}
}