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

/* ========================================
   WORKOUT HISTORY
   ======================================== */

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

/* ========================================
   MONTHLY VOLUME
   Current Month Only
   ======================================== */

const currentMonth =
	new Date().getMonth();

const currentYear =
	new Date().getFullYear();

let vol = 0;
let monthExercises = 0;

hist.forEach(x => {

	if(!x.WorkoutDate){
		return;
	}

	const workoutDate =
		new Date(x.WorkoutDate);

	if(
		workoutDate.getMonth() === currentMonth &&
		workoutDate.getFullYear() === currentYear
	){

		vol +=
			Number(
				x.Volume || 0
			);

		monthExercises++;

	}

});

monthVolume.innerText =
	vol.toLocaleString() + ' pts';

monthCount.innerText =
	monthExercises +
	' Exercises Logged';

/* ========================================
   DASHBOARD CARDS
   ======================================== */

renderTopMuscleGroups(hist);
renderRecentActivity(hist);
//renderBattleLines();
//renderBattleLines2();
renderBattleLinesSummary();
renderLeadChase();
renderPreviousMonthResults();
renderMonthComparison();

/* ========================================
   CURRENT STREAK
   ======================================== */

const workoutDays =
	[

		...new Set(
			hist
				.map(x =>
					String(x.WorkoutDate)
						.substring(0,10)
				)
				.filter(Boolean)
		)
	].sort();

let streakCount = 0;

const latestWorkoutDay =
	workoutDays.length
		? workoutDays[
			workoutDays.length - 1
		  ]
		: null;

const parts =
	latestWorkoutDay.split('-');

const checkDate =
	new Date(
		Number(parts[0]),
		Number(parts[1]) - 1,
		Number(parts[2])
	);

while(true){

	const dayText =
		checkDate.getFullYear() +
		'-' +
		String(
			checkDate.getMonth() + 1
		).padStart(2,'0') +
		'-' +
		String(
			checkDate.getDate()
		).padStart(2,'0');

	if(
		workoutDays.includes(dayText)
	){
		streakCount++;

		checkDate.setDate(
			checkDate.getDate() - 1
		);
	}
	else{
		break;
	}

}

streak.innerText =
	'🔥 ' +
	streakCount +
	' Day' +
	(streakCount === 1 ? '' : 's');
}



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
   BATTLE LINES SUMMARY
   ======================================== */
async function renderBattleLinesSummary(){

	const box =
		document.getElementById(
			'battleLinesList2'
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
					'&user=' +
					getUserCode() +
					'&t=' +
					Date.now()
				)
			).json();

		if(!data.length){

			box.innerHTML =
				'<div class="card-row-value">No battle data yet</div>';

			return;
		}

		const battles =
			data.filter(
				x =>
					x.WorkoutArea &&
					x.WorkoutArea !== 'TOTAL VOLUME'
			);

		const me =
			getUserCode();

		/* ========================================
		   BIGGEST LEAD / DEFICIT
		   ======================================== */

		const largestMargin =
			[...battles]
			.sort(
				(a,b) =>
					Number(b.Difference || 0) -
					Number(a.Difference || 0)
			)[0];

		/* ========================================
		   TAKEOVER OPPORTUNITY
		   ======================================== */

		const opportunities =
			battles.filter(
				x =>
					x.LeaderUserCode &&
					x.LeaderUserCode !== me
			);

		const takeoverOpportunity =
			opportunities
			.sort(
				(a,b) =>
					Number(a.Difference || 0) -
					Number(b.Difference || 0)
			)[0];

		/* ========================================
		   MONTHLY LEADER
		   ======================================== */

		const standingsMap = {};

		data.forEach(x => {

			if(x.LeftUserCode){

				standingsMap[x.LeftUserCode] =
					Math.max(
						standingsMap[x.LeftUserCode] || 0,
						Number(
							x.MonthlyLeftTotal || 0
						)
					);

			}

			if(x.RightUserCode){

				standingsMap[x.RightUserCode] =
					Math.max(
						standingsMap[x.RightUserCode] || 0,
						Number(
							x.MonthlyRightTotal || 0
						)
					);

			}

		});

		const standings =
			Object.keys(standingsMap)
			.map(user => ({
				user,
				total: standingsMap[user]
			}))
			.sort(
				(a,b) =>
					b.total - a.total
			);

		const myIndex =
			standings.findIndex(
				x => x.user === me
			);

		let volumeLeader = null;
		let volumeGap = 0;

		if(myIndex >= 0){

			if(myIndex === 0){

				volumeLeader =
					standings[1] ||
					standings[0];

			}
			else{

				volumeLeader =
					standings[myIndex - 1];

			}

			if(volumeLeader){

				volumeGap =
					Math.abs(
						standings[myIndex].total -
						volumeLeader.total
					);

			}

		}

		let html = '';

		if(takeoverOpportunity){

			html += `
				<div class="card-row">
					<div class="card-row-label">
						🎯 Takeover Opportunity
					</div>
					<div class="card-row-value">
						${takeoverOpportunity.WorkoutArea}
						(${Number(
							takeoverOpportunity.Difference || 0
						).toLocaleString()})
					</div>
				</div>
			`;

		}

		if(largestMargin){

			const largestLabel =
				largestMargin.LeaderUserCode === me
					? '🏆 Biggest Lead'
					: '⚠️ Biggest Deficit';

			html += `
				<div class="card-row">
					<div class="card-row-label">
						${largestLabel}
					</div>
					<div class="card-row-value">
						${largestMargin.WorkoutArea}
						(${Number(
							largestMargin.Difference || 0
						).toLocaleString()})
					</div>
				</div>
			`;

		}

		if(volumeLeader){

			const myTotal =
				standings[myIndex].total;

			const leaderTotal =
				volumeLeader.total;

			const combinedTotal =
				myTotal + leaderTotal;

			const myPct =
				combinedTotal
					? Math.round(
						(myTotal / combinedTotal) * 100
					)
					: 50;

			const leaderPct =
				100 - myPct;

			html += `
				<div class="card-row">
					<div class="card-row-label">
						👑 Monthly Leader
					</div>
					<div class="card-row-value">
						${volumeLeader.user}
						(${volumeGap.toLocaleString()})
					</div>
				</div>

				<div class="battle-lines-mini">

					<div class="battle-line-track">

						<div class="battle-line-center"></div>

						<div
							class="battle-line-fill left"
							style="width:${myPct}%">
						</div>

						<div
							class="battle-line-fill right"
							style="width:${leaderPct}%">
						</div>

					</div>

					<div class="battle-line-footer">

						<span>
							${me} ${myTotal.toLocaleString()}
						</span>

						<span>
							${volumeLeader.user} ${leaderTotal.toLocaleString()}
						</span>

					</div>

				</div>
			`;

		}

		html += `
			<div class="battle-lines-link">
				⚔️ View Full Battle Lines →
			</div>
		`;

		box.innerHTML = html;

	}
	catch(err){

		console.error(
			'Battle Lines Summary failed:',
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

/* ========================================
   MONTH COMPARISON
   Previous Month vs Current Month
   Battle Lines Style
   ======================================== */
async function renderMonthComparison(){

	const box =
		document.getElementById(
			'personalMonthComparison'
		);

	if(!box){
		return;
	}

	try{

		const data =
			await (
				await fetch(
					API +
					'?action=getPersonalMonthComparison' +
					'&user=' +
					getUserCode() +
					'&t=' +
					Date.now()
				)
			).json();

		const today = new Date();

		const currentMonthLabel =
			today.toLocaleString(
				'en-US',
				{ month:'long' }
			);

		const previousDate =
			new Date(
				today.getFullYear(),
				today.getMonth() - 1,
				1
			);

		const previousMonthLabel =
			previousDate.toLocaleString(
				'en-US',
				{ month:'long' }
			);

		const previousMonth = data.PreviousMonth || '';
		const currentMonth = data.CurrentMonth || '';

		let html = `
			<div class="battle-line-header">
				<span>${previousMonthLabel}</span>
				<span>${currentMonthLabel}</span>
			</div>
		`;

		(data.Areas || [])
			.sort((a,b) => b.Difference - a.Difference)
			.forEach(x => {

				const previousScore = Number(x.PreviousScore || 0);
				const currentScore = Number(x.CurrentScore || 0);
				const leaderMonth = x.LeaderMonth || 'TIE';

				let behindPct = 0;
				let aheadPct = 0;

if(previousScore > currentScore){

	behindPct = Math.min(
		100,
		Math.round(
			((previousScore - currentScore) / previousScore) * 50
		)
	);

}
else{

	behindPct = 0;

} 
if(currentScore > previousScore){

	aheadPct = Math.min(
		100,
		Math.round(
			((currentScore - previousScore) / currentScore) * 50
		)
	);

}
else{

	aheadPct = 0;

} 


				const diffClass =
					leaderMonth === previousMonth
						? 'battle-line-winner-left'
						: leaderMonth === currentMonth
							? 'battle-line-winner-right'
							: 'battle-line-even';

				const diffText =
					previousScore === currentScore
						? 'Even'
						: Number(x.Difference || 0).toLocaleString();

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

<div class="month-progress-track">

	<div class="month-progress-center"></div>

	<div
		class="month-progress-fill-left"
		style="width:${behindPct}%">
	</div>
	<div
		class="month-progress-fill-right"
		style="width:${aheadPct}%">
	</div>

</div>

						<div class="battle-line-footer">
							<span>${previousScore.toLocaleString()}</span>
							<span>${currentScore.toLocaleString()}</span>
						</div>

					</div>
				`;
			});

		html += `
			<div class="month-label" style="margin-top:10px;text-align:center;">
				${Number(data.PercentComplete || 0)}% of last month
			</div>
		`;

	box.innerHTML = html;

	}
	catch(err){

		console.error(
			'Month Comparison failed',
			err
		);

		box.innerHTML =
			'<div class="card-row-value">Month comparison unavailable</div>';

	}
}

/* ========================================
   PREVIOUS MONTH RESULTS
   Previous Month Champion
   ======================================== */

async function renderPreviousMonthResults(){

	const box =
		document.getElementById(
			'previousMonthResults'
		);

	if(!box){
		return;
	}

	try{

		const data =
			await (
				await fetch(
					API +
					'?action=getPreviousMonthResults' +
					'&user=' +
					getUserCode() +
					'&t=' +
					Date.now()
				)
			).json();

		const winner =
			data.WinnerUserCode || 'N/A';

		const score =
			Number(
				data.WinnerScore || 0
			).toLocaleString();

		const areasWon =
			Number(
				data.AreasWon || 0
			);

		const totalAreas =
			Number(
				data.TotalAreas || 0
			);

		box.innerHTML = `

			<div class="kpi">

				<div class="kpi-value">
					${winner}
				</div>

				<div
					class="kpi-label"
					style="
						margin-top:8px;
						font-size:18px;
						font-weight:700;
						color:#4ea1ff;
					">

					${score} points

				</div>

				<div
					class="kpi-label"
					style="
						margin-top:10px;
					">

					Won ${areasWon} of ${totalAreas} Areas

				</div>

			</div>

		`;

	}
	catch(err){

		console.error(
			'Previous Month Results failed',
			err
		);

		box.innerHTML =
			'<div class="card-row-value">Unable to load previous month results</div>';

	}
}


