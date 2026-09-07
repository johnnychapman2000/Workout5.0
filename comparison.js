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
	behindPct > 0
		? 'battle-line-winner-left'
		: aheadPct > 0
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
