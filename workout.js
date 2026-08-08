/* ========================================
   WORKOUT PAGE LOGIC
   ======================================== */

let CW,CE,saving=false,EXERCISES=[],HISTORY=[];

async function init(){try{

const w=await(await fetch(API+'?action=getCurrentWorkoutDetails')).json();


const p=await(
	await fetch(
		API+
		'?action=getWorkoutProgress'+
		'&user='+
		getUserCode()
	)
).json();


const steps=await(
	await fetch(
		API+
		'?action=getTodaySteps'+
		'&user='+
		getUserCode()
	)
).json();

HISTORY=await(
	await fetch(
		API+
		'?action=getWorkoutHistory'+
		'&user='+
		getUserCode()
	)
).json();


	CW=w;


EXERCISES=await(
  await fetch(API+'?action=getExerciseMaster')
).json();

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

h+='<div class=section>Completed</div>';
if(steps.completed){
  h+=`<div class=row><div>Steps</div><div class=target>${steps.steps}</div><div class='dot green'></div></div>`;
}

w.Exercises.filter(x=>done.includes(String(x.ExerciseID))).forEach(e=>h+=row(e,true));list.innerHTML=h;}

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
			String(x.PlanName).trim()===String(CW.PlanName).trim()
		);

		if(log){

			if(log.Weight){
				display=`${log.Sets}×${log.Reps}×${log.Weight}`;
			}
			else{
				display=`${log.Sets}×${log.Reps}`;
			}

		}

	}

	return `<div class=row onclick='openEx(${e.ExerciseID})'>
		<div>${e.ExerciseName}</div>
		<div class=target>${display}</div>
		<div class='dot ${c?'green':'red'}'></div>
	</div>`;
}

function openEx(id){
	CE=CW.Exercises.find(x=>x.ExerciseID==id);
	ename.innerText=CE.ExerciseName;

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

console.log(
	'SAVE PAYLOAD',
	payload
);

    const response=await fetch(API,{
      method:'POST',
      body:JSON.stringify(payload)
    });

    saveBtn.innerText='Saved ✓';

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