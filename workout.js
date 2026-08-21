/* ========================================
   WORKOUT PAGE LOGIC
   ======================================== */

let CW,CE,saving=false,EXERCISES=[],HISTORY=[],LEADCHASE=[];

async function init(){try{

const w =
	await getCachedData(
		getProfileCacheKey(
			CACHE_KEYS.CURRENT_WORKOUT_DETAILS,
			getUserCode()
		),
		async () => {

			return await (
				await fetch(
					API +
					'?action=getCurrentWorkoutDetails' +
					'&user=' +
					getUserCode() +
					'&t=' +
					Date.now()
				)
			).json();

		},
		15
	);


const p =
	await getCachedData(
		getProfileCacheKey(
			CACHE_KEYS.CURRENT_WORKOUT_PROGRESS,
			getUserCode()
		),
		async () => {

			return await (
				await fetch(
					API +
					'?action=getWorkoutProgress' +
					'&user=' +
					getUserCode()
				)
			).json();

		},
		2
	);


const steps =
	await getCachedData(
		getProfileCacheKey(
			'w6_today_steps',
			getUserCode()
		),
		async () => {

			return await (
				await fetch(
					API +
					'?action=getTodaySteps' +
					'&user=' +
					getUserCode()
				)
			).json();

		},
		2
	);
			

HISTORY =
	await getCachedData(
		getProfileCacheKey(
			CACHE_KEYS.WORKOUT_HISTORY,
			getUserCode()
		),
		async () => {

			return await (
				await fetch(
					API +
					'?action=getWorkoutHistory' +
					'&user=' +
					getUserCode()
				)
			).json();

		},
		5
	);


	CW=w;

LEADCHASE =
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

console.log('LEAD CHASE DATA', LEADCHASE);

EXERCISES =
	await getCachedData(
		CACHE_KEYS.EXERCISE_MASTER,
		async () => {

			return await (
				await fetch(
					API +
					'?action=getExerciseMaster'
				)
			).json();

		},
		0
	);	

	document.getElementById('workoutTitle').innerText=
		w.PlanName;

	let heroImage='images/FullBody.png';

	if(w.PlanName==='Chest & Shoulders'){
		heroImage='images/ChestShouldersHighlited.png';
	}
	else if(w.PlanName==='Full Body Conditioning'){
		heroImage='images/FullBody.png';
	}
	else if(w.PlanName==='Back & Biceps'){
		heroImage='images/BackBicepsHighlighted.png';
	}
	else if(w.PlanName==='Legs'){
		heroImage='images/LegsHighlighted.png';
	}
	else if(w.PlanName==='Chest'){
		heroImage='images/ChestHighlighted.png';
	}
	else if(w.PlanName==='Shoulders'){
		heroImage='images/ShouldersHighlighted.png';
	}
	else if(w.PlanName==='Back'){
		heroImage='images/BackHighlighted.png';
	}
	else if(w.PlanName==='Biceps'){
		heroImage='images/BicepsHighlighted.png';
	}
	else if(w.PlanName==='Triceps'){
		heroImage='images/TricepsHighlighted.png';
	}
	else if(w.PlanName==='Abs'){
		heroImage='images/AbsHighlighted.png';
	}

	else if(w.PlanName==='Recovery and Stretching'){
		heroImage='images/RecoveryStretchingHighlighted.png';
	}

	document.getElementById('workoutHero').src=heroImage;

let pct=p.PercentComplete||0;

	document.getElementById('progressPercent').innerText=
		pct+'%';

	document.getElementById('progressFill').style.width=
		pct+'%';

prog.innerText=
	p.CompletedExercises+
	' / '+
	p.TotalExercises+
	' Complete';

let done=p.CompletedExerciseIDs||[];

let h='<div class=section>Remaining</div>';

if(!steps.completed){
  h+=`
	<div class=row onclick="openSteps()"><div>Steps</div>
	<div class=target>Daily</div>
	<div class='dot red'></div></div>`;
}


w.Exercises.filter(x=>!done.includes(String(x.ExerciseID))).forEach(e=>h+=row(e,false));

const leadArea =
    LEADCHASE.length
        ? LEADCHASE[0].WorkoutArea
        : 'None';

const chaseExercises =
	EXERCISES.filter(
		x => x.WorkoutArea === leadArea
	);

console.log(
	'LEAD AREA',
	leadArea
);

console.log(
	'CHASE EXERCISES',
	chaseExercises.map(
		x => ({
			Name:x.ExerciseName,
			Area:x.WorkoutArea
		})
	)
);


console.log(
	'Lead Chase Exercises',
	chaseExercises
);

const historyExercises =
	chaseExercises.filter(e =>
		HISTORY.some(h =>
			String(h.ExerciseID) === String(e.ExerciseID)
		)
	);

const completedTodayIds =
	new Set(
		HISTORY
			.filter(h =>
				String(h.WorkoutDate).substring(0,10) === getToday()
			)
			.map(h =>
				String(h.ExerciseID)
			)
	);

const chasePlan = [];

historyExercises.forEach(exercise => {

	const logs =
		HISTORY.filter(h =>
			String(h.ExerciseName).trim() ===
			String(exercise.ExerciseName).trim()
		);

if(logs.length){

	let volume = 0;

	if(Number(logs[0].Weight || 0) > 0){

		volume =
			Number(logs[0].Sets || 0) *
			Number(logs[0].Reps || 0) *
			Number(logs[0].Weight || 0);

	}
	else{

		volume =
			Number(logs[0].Sets || 0) *
			Number(logs[0].Reps || 0);

	}

chasePlan.push({
	ExerciseID: exercise.ExerciseID,
	ExerciseName: exercise.ExerciseName,
	Sets: logs[0].Sets,
	Reps: logs[0].Reps,
	Weight: logs[0].Weight,
	Volume: volume
});
}

});

chasePlan.sort(
	(a,b) => b.Volume - a.Volume
);

console.log(
	'CHASE PLAN COUNT',
	chasePlan.length
);

console.log(
	'CHASE PLAN SORTED',
	chasePlan
);

console.log(
	'CHASE PLAN SORTED',
	chasePlan
);

let chaseNeeded =
	LEADCHASE.length
		? Number(
			LEADCHASE[0].Difference || 0
		)
		: 0;

let chaseRunningTotal = 0;

const recommendedPlan = [];

for(const item of chasePlan){

	if(
		completedTodayIds.has(
			String(item.ExerciseID)
		)
	){
		continue;
	}

	recommendedPlan.push(item);

	chaseRunningTotal += item.Volume;

	if(
		chaseRunningTotal >= chaseNeeded ||
		recommendedPlan.length >= 3
	){
		break;
	}

}

const remainingExercises =
	chaseExercises.filter(x =>
		!recommendedPlan.some(r =>
			String(r.ExerciseName).trim() ===
			String(x.ExerciseName).trim()
		) &&
		!completedTodayIds.has(
			String(x.ExerciseID)
		)
	);

remainingExercises.forEach(exercise => {

	if(recommendedPlan.length >= 3){
		return;
	}

	recommendedPlan.push({
		ExerciseID:exercise.ExerciseID,
		ExerciseName:exercise.ExerciseName,
		Sets:'',
		Reps:'',
		Weight:'',
		Volume:0
	});

});


historyExercises.forEach(x =>
	console.log(
		'CHASE EXERCISE',
		x.ExerciseName
	)
);

historyExercises.forEach(exercise => {

	const logs =
		HISTORY.filter(h =>
			String(h.ExerciseName).trim() ===
			String(exercise.ExerciseName).trim()
		);

	if(logs.length){

const volume =
	Number(logs[0].Sets || 0) *
	Number(logs[0].Reps || 0) *
	Number(logs[0].Weight || 0);

	}

});

const chaseGap =
	LEADCHASE.length
		? Number(
			LEADCHASE[0].Difference || 0
		).toLocaleString()
		: '0';

const leadAmount =
	chaseRunningTotal -
	Number(
		LEADCHASE[0]?.Difference || 0
	);

const canTakeLead =
	leadAmount >= 0;

const chaseLeader =
	LEADCHASE.length
		? LEADCHASE[0].LeaderUserCode
		: '';

const chaseUnit =
	LEADCHASE.length
		? LEADCHASE[0].UnitLabel || 'lbs'
		: 'lbs';

h+='<div class=section>🎯 Lead Chase - ' + leadArea + '</div>';
h+='<div class=section style="padding-top:6px;color:#4caf50;">' +
	(
		canTakeLead
			? '✅ Can Take Lead Today (+' +
			  leadAmount.toLocaleString() +
			  ' ' + chaseUnit + ' Lead)'
			: '⚠ After Workout: ' +
  Math.abs(leadAmount).toLocaleString() +
  ' ' + chaseUnit + ' Behind'

	) +
	'</div>';

recommendedPlan.forEach(item => {

	h+=`
		<div class=row onclick='openEx(${item.ExerciseID})'>
			<div>${item.ExerciseName}</div>
			<div class=target>
				${item.Weight
					? `${item.Sets}x${item.Reps}x${item.Weight}`
					: `${item.Sets}x${item.Reps}`
				}
			</div>
			<div class='dot red'></div>
		</div>
	`;

});

const leadArea2 =
    LEADCHASE.length > 1
        ? LEADCHASE[1].WorkoutArea
        : 'None';

const chaseExercises2 =
    EXERCISES.filter(
        x => x.WorkoutArea === leadArea2
    );

console.log(
    'LEAD AREA 2',
    leadArea2
);

const historyExercises2 =
    chaseExercises2.filter(e =>
        HISTORY.some(h =>
            String(h.ExerciseID) === String(e.ExerciseID)
        )
    );

const chasePlan2 = [];

historyExercises2.forEach(exercise => {

    const logs =
        HISTORY.filter(h =>
            String(h.ExerciseName).trim() ===
            String(exercise.ExerciseName).trim()
        );

    if(logs.length){

        let volume = 0;

        if(Number(logs[0].Weight || 0) > 0){

            volume =
                Number(logs[0].Sets || 0) *
                Number(logs[0].Reps || 0) *
                Number(logs[0].Weight || 0);

        }
        else{

            volume =
                Number(logs[0].Sets || 0) *
                Number(logs[0].Reps || 0);

        }

        chasePlan2.push({
            ExerciseID: exercise.ExerciseID,
            ExerciseName: exercise.ExerciseName,
            Sets: logs[0].Sets,
            Reps: logs[0].Reps,
            Weight: logs[0].Weight,
            Volume: volume
        });

    }

});

chasePlan2.sort(
    (a,b) => b.Volume - a.Volume
);

let chaseNeeded2 =
    Number(
        LEADCHASE[1]?.Difference || 0
    );

let chaseRunningTotal2 = 0;

const recommendedPlan2 = [];

for(const item of chasePlan2){

    if(
        completedTodayIds.has(
            String(item.ExerciseID)
        )
    ){
        continue;
    }

    recommendedPlan2.push(item);

    chaseRunningTotal2 += item.Volume;

    if(
        chaseRunningTotal2 >= chaseNeeded2 ||
        recommendedPlan2.length >= 3
    ){
        break;
    }

}

const remainingExercises2 =
    chaseExercises2.filter(x =>
        !recommendedPlan2.some(r =>
            String(r.ExerciseName).trim() ===
            String(x.ExerciseName).trim()
        ) &&
        !completedTodayIds.has(
            String(x.ExerciseID)
        )
    );

remainingExercises2.forEach(exercise => {

    if(recommendedPlan2.length >= 3){
        return;
    }

    recommendedPlan2.push({
        ExerciseID:exercise.ExerciseID,
        ExerciseName:exercise.ExerciseName,
        Sets:'',
        Reps:'',
        Weight:'',
        Volume:0
    });

});

const chaseGap2 =
    Number(
        LEADCHASE[1]?.Difference || 0
    ).toLocaleString();

const leadAmount2 =
    chaseRunningTotal2 -
    Number(
        LEADCHASE[1]?.Difference || 0
    );

const canTakeLead2 =
    leadAmount2 >= 0;

const chaseLeader2 =
    LEADCHASE[1]?.LeaderUserCode || '';

const chaseUnit2 =
    LEADCHASE[1]?.UnitLabel || 'lbs';

h += '<div class=section>🎯 Lead Chase - ' + leadArea2 + '</div>';

h += '<div class=section style="padding-top:6px;color:#4caf50;">' +
    (
        canTakeLead2
            ? '✅ Can Take Lead Today (+' +
              leadAmount2.toLocaleString() +
              ' ' + chaseUnit2 + ' Lead)'
            : '⚠ After Workout: ' +
              Math.abs(leadAmount2).toLocaleString() +
              ' ' + chaseUnit2 + ' Behind'
    ) +
    '</div>';

recommendedPlan2.forEach(item => {

    h += `
        <div class=row onclick='openEx(${item.ExerciseID})'>
            <div>${item.ExerciseName}</div>
            <div class=target>
                ${item.Weight
                    ? `${item.Sets}x${item.Reps}x${item.Weight}`
                    : `${item.Sets}x${item.Reps}`
                }
            </div>
            <div class='dot red'></div>
        </div>
    `;

});


const leadArea3 =
    LEADCHASE.length > 2
        ? LEADCHASE[2].WorkoutArea
        : 'None';

const chaseExercises3 =
    EXERCISES.filter(
        x => x.WorkoutArea === leadArea3
    );

console.log(
    'LEAD AREA 3',
    leadArea3
);

console.log(
    'CHASE EXERCISES 3',
    chaseExercises3.map(
        x => ({
            Name:x.ExerciseName,
            Area:x.WorkoutArea
        })
    )
);

const historyExercises3 =
    chaseExercises3.filter(e =>
        HISTORY.some(h =>
            String(h.ExerciseID) === String(e.ExerciseID)
        )
    );

const chasePlan3 = [];

historyExercises3.forEach(exercise => {

    const logs =
        HISTORY.filter(h =>
            String(h.ExerciseName).trim() ===
            String(exercise.ExerciseName).trim()
        );

    if(logs.length){

        let volume = 0;

        if(Number(logs[0].Weight || 0) > 0){

            volume =
                Number(logs[0].Sets || 0) *
                Number(logs[0].Reps || 0) *
                Number(logs[0].Weight || 0);

        } else {

            volume =
                Number(logs[0].Sets || 0) *
                Number(logs[0].Reps || 0);

        }

        chasePlan3.push({
            ExerciseID: exercise.ExerciseID,
            ExerciseName: exercise.ExerciseName,
            Sets: logs[0].Sets,
            Reps: logs[0].Reps,
            Weight: logs[0].Weight,
            Volume: volume
        });

    }

});

chasePlan3.sort(
    (a,b) => b.Volume - a.Volume
);

let chaseNeeded3 =
    Number(
        LEADCHASE[2]?.Difference || 0
    );

let chaseRunningTotal3 = 0;

const recommendedPlan3 = [];

for(const item of chasePlan3){

    if(
        completedTodayIds.has(
            String(item.ExerciseID)
        )
    ){
        continue;
    }

    recommendedPlan3.push(item);

    chaseRunningTotal3 += item.Volume;

    if(
        chaseRunningTotal3 >= chaseNeeded3 ||
        recommendedPlan3.length >= 3
    ){
        break;
    }

}

const remainingExercises3 =
    chaseExercises3.filter(x =>
        !recommendedPlan3.some(r =>
            String(r.ExerciseName).trim() ===
            String(x.ExerciseName).trim()
        ) &&
        !completedTodayIds.has(
            String(x.ExerciseID)
        )
    );

remainingExercises3.forEach(exercise => {

    if(recommendedPlan3.length >= 3){
        return;
    }

    recommendedPlan3.push({
        ExerciseID:exercise.ExerciseID,
        ExerciseName:exercise.ExerciseName,
        Sets:'',
        Reps:'',
        Weight:'',
        Volume:0
    });

});

historyExercises3.forEach(x =>
    console.log(
        'CHASE EXERCISE 3',
        x.ExerciseName
    )
);

const chaseGap3 =
    Number(
        LEADCHASE[2]?.Difference || 0
    ).toLocaleString();

const leadAmount3 =
    chaseRunningTotal3 -
    Number(
        LEADCHASE[2]?.Difference || 0
    );

const canTakeLead3 =
    leadAmount3 >= 0;

const chaseLeader3 =
    LEADCHASE[2]?.LeaderUserCode || '';

const chaseUnit3 =
    LEADCHASE[2]?.UnitLabel || 'lbs';

h += '<div class=section>🎯 Lead Chase - ' + leadArea3 + '</div>';

h +=
    '<div class=section style="padding-top:6px;color:#4caf50;">' +
    (
        canTakeLead3
            ? '✅ Can Take Lead Today (+' +
              leadAmount3.toLocaleString() +
              ' ' + chaseUnit3 + ' Lead)'
            : '⚠ After Workout: ' +
              Math.abs(leadAmount3).toLocaleString() +
              ' ' + chaseUnit3 + ' Behind'
    ) +
    '</div>';

recommendedPlan3.forEach(item => {

    h += `
        <div class=row onclick='openEx(${item.ExerciseID})'>
            <div>${item.ExerciseName}</div>
            <div class=target>
                ${item.Weight
                    ? `${item.Sets}x${item.Reps}x${item.Weight}`
                    : `${item.Sets}x${item.Reps}`
                }
            </div>
            <div class='dot red'></div>
        </div>
    `;

});const workoutHistoryByExercise = {};

HISTORY.forEach(log => {

	if(!log.ExerciseName){
		return;
	}

	if(!workoutHistoryByExercise[log.ExerciseName]){
		workoutHistoryByExercise[log.ExerciseName] = 0;
	}

	workoutHistoryByExercise[log.ExerciseName] +=
		Number(log.Volume || 0);

});

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const currentMonthVolume = {};
const previousMonthVolume = {};

HISTORY.forEach(log => {

	if(!log.ExerciseName){
		return;
	}

	const logDate = new Date(log.WorkoutDate);

	const logMonth = logDate.getMonth();
	const logYear = logDate.getFullYear();

	if(
		logMonth === currentMonth &&
		logYear === currentYear
	){

		if(!currentMonthVolume[log.ExerciseName]){
			currentMonthVolume[log.ExerciseName] = 0;
		}

		currentMonthVolume[log.ExerciseName] +=
			Number(log.Volume || 0);

	}

	const prevDate = new Date();
	prevDate.setMonth(prevDate.getMonth() - 1);

	if(
		logMonth === prevDate.getMonth() &&
		logYear === prevDate.getFullYear()
	){

		if(!previousMonthVolume[log.ExerciseName]){
			previousMonthVolume[log.ExerciseName] = 0;
		}

		previousMonthVolume[log.ExerciseName] +=
			Number(log.Volume || 0);

	}

});



const attentionScores = [];

EXERCISES.forEach(exercise => {

	const exerciseName =
		exercise.ExerciseName;

const current =
	currentMonthVolume[exerciseName] || 0;

const previous =
	previousMonthVolume[exerciseName] || 0;

	let score = 0;

if(previous === 0){

	score =
		current > 0
			? 100
			: -100;

}
else{

	const expected =
		previous * monthProgress;

	score =
		Math.round(
			((current - expected) / expected) * 100
		);

}

attentionScores.push({
	ExerciseName: exerciseName,
	Current: current,
	Previous: previous,
	Score: score
});
});


attentionScores.sort(
	(a,b) => a.Score - b.Score
);



attentionScores
	.slice(0,10)
	.forEach(x =>
		console.log(
			'BOTTOM',
			x.ExerciseName,
			x.Score
		)
	);


attentionScores.slice(0,5).forEach(x =>
	console.log(
		'ATTENTION',
		x.ExerciseName,
		'Current:',
		x.Current,
		'Previous:',
		x.Previous,
		'Score:',
		x.Score
	)
);

const today = new Date();

const daysInMonth =
	new Date(
		today.getFullYear(),
		today.getMonth() + 1,
		0
	).getDate();

const monthProgress =
	today.getDate() / daysInMonth;

console.log(
	'MONTH PROGRESS',
	Math.round(monthProgress * 100) + '%'
);

h+='<div class=section>⭐ Needs Attention</div>';

const exerciseLookup = {};

EXERCISES.forEach(ex => {
	exerciseLookup[ex.ExerciseName] = ex;
});

console.log(
	'ACTIVE EXERCISES',
	EXERCISES.map(x => x.ExerciseName)
);

attentionScores
	.slice(0,10)
	.forEach(item => {

		const ex =
			exerciseLookup[item.ExerciseName];

		if(!ex){
			return;
		}

		h+=`
			<div class=row onclick='openEx(${ex.ExerciseID})'>
				<div>${item.ExerciseName}</div>
				<div class=target>${item.Score}%</div>
				<div class='dot red'></div>
			</div>
		`;

	});

h+='<div class=section>Completed</div>';

if(steps.completed){
  h+=`<div class=row><div>Steps</div><div class=target>${steps.steps}</div><div class='dot green'></div></div>`;
}

const completedToday =
	HISTORY.filter(x =>
		String(x.WorkoutDate).substring(0,10) === getToday()
	);

const renderedIds = new Set();

w.Exercises
	.filter(x => done.includes(String(x.ExerciseID)))
	.forEach(e => {
		renderedIds.add(String(e.ExerciseID));
		h += row(e,true);
	});

completedToday.forEach(log => {

	if(
		renderedIds.has(
			String(log.ExerciseID)
		)
	){
		return;
	}

	if(
		String(log.ExerciseName) === 'Steps'
	){
		return;
	}

	renderedIds.add(
		String(log.ExerciseID)
	);

	h += `
		<div class=row>
			<div>${log.ExerciseName}</div>
			<div class=target>
				${log.Weight
					? `${log.Sets}×${log.Reps}×${log.Weight}`
					: `${log.Sets}×${log.Reps}`
				}
			</div>
			<div class='dot green'></div>
		</div>
	`;
});

list.innerHTML=h;
}

catch(e){
  console.error(e);

  list.innerHTML =
    '<div style="color:#ff5757;padding:20px;">' +
    e.message +
    '</div>';
}

}

function getToday(){

	const d = new Date();

	const year = d.getFullYear();
	const month = String(
		d.getMonth() + 1
	).padStart(2,'0');

	const day = String(
		d.getDate()
	).padStart(2,'0');

	return `${year}-${month}-${day}`;
}

function row(e,c){

	let display='';

	if(c){

const log=HISTORY.find(x=>
	String(x.ExerciseID)===String(e.ExerciseID) &&
	String(x.WorkoutDate).substring(0,10)===getToday()
);

if(e.ExerciseName === 'Rear Deltoid'){

}
		if(log){

			if(log.Weight){
				display=`${log.Sets}×${log.Reps}×${log.Weight}`;
			}
			else{
				display=`${log.Sets}×${log.Reps}`;
			}

		}

	}

if(c){

}

	return `<div class=row onclick='openEx(${e.ExerciseID})'>
		<div>${e.ExerciseName}</div>
		<div class=target>${display}</div>
		<div class='dot ${c?'green':'red'}'></div>
	</div>`;
}

function openEx(id){

	CE =
		CW.Exercises.find(
			x => String(x.ExerciseID) === String(id)
		);

	if(!CE){
		CE =
			EXERCISES.find(
				x => String(x.ExerciseID) === String(id)
			);
	}

	if(!CE){
		return;
	}

	ename.innerText = CE.ExerciseName;
	sets.value='';
  	reps.value='';
  	weight.value='';

	sets.placeholder='Sets';
	reps.placeholder='Reps';
	weight.placeholder='Weight';


	reps.style.display='block';weight.style.display='block';weight.placeholder='Weight';if(CE.ExerciseType==='Bodyweight'){weight.style.display='none';}if(CE.ExerciseType==='Duration'){weight.placeholder='Duration (seconds)';}workoutModal.style.display='block';}

	function openSteps(){
		CE={
    		ExerciseID:41,
    		ExerciseName:'Steps',
    		ExerciseType:'Endurance',
    		WorkoutArea:'Cardio'
  	};

  	ename.innerText='Steps';
  	sets.placeholder='Steps Count';

  	reps.style.display='none';
  	weight.style.display='none';

  	workoutModal.style.display='block';
	}

function closeWorkout(){

	workoutModal.style.display='none';

	sets.placeholder='Sets';

	reps.style.display='block';

	weight.style.display='block';
	weight.placeholder='Weight';
}

async function saveExercise(){

  if(saving) return;

  saving=true;

  saveBtn.disabled=true;
  saveBtn.innerText='Processing...';

  const payload={
    action:'saveWorkoutLog',
    UserCode:getUserCode(),
    WorkoutDate:getToday(),
    PlanName:CW.PlanName,
    WorkoutArea:CE?CE.WorkoutArea:'Steps',
    ExerciseID:CE?CE.ExerciseID:'Steps',
    ExerciseName:CE?CE.ExerciseName:'Steps',
    ExerciseType:CE?CE.ExerciseType:'Steps',
    Sets:sets.value||'',
    Reps:reps.style.display==='none'?'':reps.value,
    Weight:weight.style.display==='none'?'':weight.value
  };

  try{

    const response=await fetch(API,{
      method:'POST',
      body:JSON.stringify(payload)
    });

saveBtn.innerText='Saved ✓';

clearCache(
	getProfileCacheKey(
		CACHE_KEYS.CURRENT_WORKOUT_DETAILS,
		getUserCode()
	)
);

clearCache(
	getProfileCacheKey(
		CACHE_KEYS.CURRENT_WORKOUT_PROGRESS,
		getUserCode()
	)
);

clearCache(
	getProfileCacheKey(
		CACHE_KEYS.WORKOUT_HISTORY,
		getUserCode()
	)
);

clearCache(
	getProfileCacheKey(
		'w6_today_steps',
		getUserCode()
	)
);

setTimeout(()=>{
	location.reload();
},800);

  }catch(err){

    saveBtn.disabled=false;
    saveBtn.innerText='Save Workout';
    saving=false;

    alert('Save Failed');
  }
}


document.getElementById('navigation').innerHTML =
	buildNavigation('workout');


init();