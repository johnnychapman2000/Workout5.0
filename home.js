/* ========================================
   HOME DASHBOARD LOGIC
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
	initializeHome();
});

async function initializeHome(){

	console.log(
		'Current User:',
		getUserCode()
	);

document.querySelector(
	'.page-title'
).innerText =
	getProfileIcon() +
	' Dashboard';

	document.getElementById('navigation').innerHTML =
		buildNavigation('home');

const w =
	await (
		await fetch(
			API +
			'?action=getCurrentWorkout' +
			'&user=' +
			getUserCode() +
			'&t=' +
			Date.now()
		)
	).json();

	workoutName.innerText = w.PlanName;

	exerciseCount.innerText =
		w.ExerciseCount + ' Exercises';

	const plans =
		await (
			await fetch(API + '?action=getWorkoutPlans')
		).json();

	const next =
		plans.find(
			p => Number(p.PlanID) === Number(w.PlanID) + 1
		) || plans[0];

	nextWorkout.innerText = next.PlanName;

const hist =
	await (
		await fetch(
			API +
			'?action=getWorkoutHistory' +
			'&user=' +
			getUserCode() +
			'&t=' +
			Date.now()
		)
	).json();

	let vol = 0;

	hist.forEach(x => {
		vol += Number(x.Volume || 0);
	});

	monthVolume.innerText =
		vol.toLocaleString() + ' lbs';

	monthCount.innerText =
		hist.length + ' Exercises Logged';

	renderTopMuscleGroups(hist);

	renderRecentActivity(hist);

renderBattleLines();

	const dates = [
		...new Set(
			hist
				.map(x =>
					String(x.WorkoutDate).substring(0,10)
				)
				.filter(Boolean)
		)
	];

	streak.innerText =
		'🔥 ' +
		dates.length +
		' Day' +
		(dates.length === 1 ? '' : 's');
}

renderLeadChase();

function renderTopMuscleGroups(history){

	const groups = {};

	history.forEach(x => {

		const area =
			x.WorkoutArea || 'Other';

		if(!groups[area]){
			groups[area] = 0;
		}

		groups[area] +=
			Number(x.Volume || 0);
	});

	const sorted =
		Object.keys(groups)
			.map(name => ({
				name: name,
				volume: groups[name]
			}))
			.sort((a,b) =>
				b.volume - a.volume
			)
			.slice(0,4);

	if(!sorted.length){

		topMuscleGroups.innerHTML =
			'<div class="card-row-value">No data yet</div>';

		return;
	}

	const max = sorted[0].volume;

	let html = '';

	sorted.forEach(x => {

		const pct = max
			? Math.round(
				(x.volume / max) * 100
			)
			: 0;

		html += `
			<div class="group">

				<div class="group-label">
					<span>${x.name}</span>
					<span>${x.volume.toLocaleString()}</span>
				</div>

				<div class="group-bar">
					<div
						class="group-fill"
						style="width:${pct}%">
					</div>
				</div>

			</div>
		`;
	});

	topMuscleGroups.innerHTML = html;
}

function renderRecentActivity(history){

	const recent =
		history
			.filter(x => x.ExerciseName)
			.slice(0,5);

	if(!recent.length){

		recentActivity.innerHTML =
			'<div class="card-row-value">No recent activity</div>';

		return;
	}

	let html = '';

	recent.forEach(x => {

		const dateText =
			formatRecentDate(
				String(x.WorkoutDate)
					.substring(0,10)
			);

		html += `
			<div class="card-row">

				<div class="card-row-label">
					${x.ExerciseName}
				</div>

				<div class="card-row-value">
					${dateText}
				</div>

			</div>
		`;
	});

	recentActivity.innerHTML = html;
}

function formatRecentDate(dateValue){

	const today = new Date();

	const todayText =
		today.getFullYear() +
		'-' +
		String(today.getMonth() + 1)
			.padStart(2,'0') +
		'-' +
		String(today.getDate())
			.padStart(2,'0');

	const yesterday = new Date();

	yesterday.setDate(
		yesterday.getDate() - 1
	);

	const yesterdayText =
		yesterday.getFullYear() +
		'-' +
		String(yesterday.getMonth() + 1)
			.padStart(2,'0') +
		'-' +
		String(yesterday.getDate())
			.padStart(2,'0');

	if(dateValue === todayText){
		return 'Today';
	}

	if(dateValue === yesterdayText){
		return 'Yesterday';
	}

	return dateValue;
}

/* ========================================
   BATTLE LINES
   ======================================== */

async function renderBattleLines(){

	const box =
		document.getElementById(
			'battleLinesList'
		);

	if(!box){
		return;
	}

	try{

		const data =
			await (
				await fetch(
					API +
					'?action=getBattleLines' +
					'&t=' +
					Date.now()
				)
			).json();

		if(!data.length){

			box.innerHTML =
				'<div class="card-row-value">No battle data yet</div>';

			return;
		}

		let html =
			'';

		data.forEach(x => {

			const leader =
				x.LeaderUserCode || 'TIE';

			const side =
				leader === 'IRONWOLF'
					? 'left'
					: leader === 'TITAN'
						? 'right'
						: 'tie';

			const pct =
				Math.min(
					100,
					Number(x.LeadPercent || 0)
				);

			let leftWidth =
				0;

			let rightWidth =
				0;

			if(side === 'left'){
				leftWidth = pct;
			}

			if(side === 'right'){
				rightWidth = pct;
			}

const unitLabel =
	x.UnitLabel || 'lbs';

const diffText =
	side === 'tie'
		? 'Even'
		: Number(x.Difference || 0).toLocaleString() +
			' ' +
			unitLabel;

const leftVolume =
	Number(
		x.LeftScore ||
		x.LeftVolume ||
		0
	).toLocaleString();

const rightVolume =
	Number(
		x.RightScore ||
		x.RightVolume ||
		0
	).toLocaleString();

const monthlyLeftTotal =
	Number(
		x.MonthlyLeftTotal || 0
	).toLocaleString();

const monthlyRightTotal =
	Number(
		x.MonthlyRightTotal || 0
	).toLocaleString();

const monthlyTotal =
	Number(x.MonthlyLeftTotal || 0) +
	Number(x.MonthlyRightTotal || 0);

const monthlyLeftWidth =
	monthlyTotal
		? (Number(x.MonthlyLeftTotal || 0) / monthlyTotal) * 100
		: 50;

const monthlyRightWidth =
	monthlyTotal
		? (Number(x.MonthlyRightTotal || 0) / monthlyTotal) * 100
		: 50;


			const diffClass =
				side === 'left'
					? 'battle-line-winner-left'
					: side === 'right'
						? 'battle-line-winner-right'
						: 'battle-line-even';

html += `
	<div class="battle-line-row">

		<div class="battle-line-top">

			<div class="battle-line-area">
				${x.WorkoutArea}
			</div>

			<div class="battle-line-diff ${diffClass}">
				${diffText}
			</div>

		</div>

		<div class="battle-line-track">

			<div class="battle-line-center"></div>

			<div
				class="battle-line-fill left"
				style="width:${leftWidth}%">
			</div>

			<div
				class="battle-line-fill right"
				style="width:${rightWidth}%">
			</div>

		</div>

		<div class="battle-line-footer">

			<span>
				${leftVolume}
			</span>

			<span>
				${rightVolume}
			</span>

		</div>

	</div>
`;

		});

if(data.length){

	const monthlyLeftTotal =
		Number(
			data[0].MonthlyLeftTotal || 0
		).toLocaleString();

	const monthlyRightTotal =
		Number(
			data[0].MonthlyRightTotal || 0
		).toLocaleString();

	const grandTotal =
		Number(data[0].MonthlyLeftTotal || 0) +
		Number(data[0].MonthlyRightTotal || 0);

let leftPct = 0;
let rightPct = 0;

const leftTotal =
	Number(data[0].MonthlyLeftTotal || 0);

const rightTotal =
	Number(data[0].MonthlyRightTotal || 0);

const diff =
	Math.abs(leftTotal - rightTotal);

const total =
	leftTotal + rightTotal;

const leadPct =
	total
		? Math.min(
			100,
			Math.round((diff / total) * 100)
		)
		: 0;

if(leftTotal > rightTotal){
	leftPct = leadPct;
}

if(rightTotal > leftTotal){
	rightPct = leadPct;
}


	html += `
		<div class="battle-line-row">

			<div class="battle-line-top">

				<div class="battle-line-area">
					TOTAL VOLUME
				</div>

			</div>

			<div class="battle-line-track">

				<div class="battle-line-center"></div>

				<div
					class="battle-line-fill left"
					style="width:${leftPct}%">
				</div>

				<div
					class="battle-line-fill right"
					style="width:${rightPct}%">
				</div>

			</div>

			<div class="battle-line-footer">

				<span>
					${monthlyLeftTotal}
				</span>

				<span>
					${monthlyRightTotal}
				</span>

			</div>

		</div>
	`;
}

		box.innerHTML =
			html;
	}
	catch(err){

		console.error(
			'Battle Lines failed:',
			err
		);

		box.innerHTML =
			'<div class="card-row-value">Battle Lines unavailable</div>';
	}
}


/* ========================================
   LEAD CHASE
   ======================================== */

async function renderLeadChase(){

	const box =
		document.getElementById(
			'leadChaseList'
		);

	if(!box){
		return;
	}

	try{

		const data =
			await (
				await fetch(
					API +
					'?action=getLeadChase' +
					'&user=' +
					getUserCode() +
					'&t=' +
					Date.now()
				)
			).json();

		if(!data.length){

			box.innerHTML =
				`
				<div class="lead-chase-row">
					<div class="lead-chase-area">
						🏆 Leading All Areas
					</div>
				</div>
				`;

			return;
		}

		let html = '';

		data.forEach((x,index) => {

			let medal = '🎯';

			if(index === 0){
				medal = '🥇';
			}
			else if(index === 1){
				medal = '🥈';
			}
			else if(index === 2){
				medal = '🥉';
			}

			html += `
				<div class="lead-chase-row">

					<div class="lead-chase-left">

						<div class="lead-chase-area">
							${medal} ${x.WorkoutArea}
						</div>

						<div class="lead-chase-leader">
							Leader: ${x.LeaderUserCode}
						</div>

					</div>

					<div class="lead-chase-gap">

						${Number(
							x.Difference || 0
						).toLocaleString()}

						${x.UnitLabel || 'lbs'}

					</div>

				</div>
			`;
		});

		box.innerHTML = html;

	}
	catch(err){

		console.error(
			'Lead Chase failed',
			err
		);

		box.innerHTML =
			'Unable to load';
	}
}