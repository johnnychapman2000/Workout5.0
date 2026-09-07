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

let html = '';

const previousTotal =
	Number(
		data.PreviousPoints || 0
	);

const currentTotal =
	Number(
		data.CurrentPoints || 0
	);

let behindPct = 0;
let aheadPct = 0;

if(previousTotal > currentTotal){

	behindPct = Math.min(
		100,
		Math.round(
			((previousTotal - currentTotal) / previousTotal) * 50
		)
	);

}

if(currentTotal > previousTotal){

	aheadPct = Math.min(
		100,
		Math.round(
			((currentTotal - previousTotal) / currentTotal) * 50
		)
	);

}


html += `

	<div class="battle-line-footer">

		<span>
			${previousTotal.toLocaleString()}
		</span>

		<span>
			${currentTotal.toLocaleString()}
		</span>

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

	<div class="month-label" style="margin-top:10px;text-align:center;">
		${Number(data.PercentComplete || 0)}% of last month's volume completed
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
