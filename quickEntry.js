let QUICK_EXERCISES = [];
let QUICK_WORKOUT = null;
let quickSaving = false;

async function initQuickEntry(){
	try{

		QUICK_EXERCISES = await (
			await fetch(API+'?action=getExerciseMaster')
		).json();

		QUICK_WORKOUT = await (
			await fetch(API+'?action=getCurrentWorkoutDetails')
		).json();

	}
	catch(err){
		console.error(err);
	}
}

function openQuickEntry(){

	quickModal.style.display='block';

	loadQuickExercises();
}

function loadQuickExercises(){

	const area=document.getElementById('area').value;
	const dd=document.getElementById('quickExercise');

	dd.innerHTML='';

	QUICK_EXERCISES
		.filter(x =>
			x.WorkoutArea === area &&
			x.Active === 'Yes'
		)
		.forEach(ex => {

			dd.innerHTML +=
				`<option value="${ex.ExerciseID}">
					${ex.ExerciseName}
				</option>`;
		});

	quickExerciseChanged();
}

function quickExerciseChanged(){

	const area =
		document.getElementById('area').value;

	const selectedName =
		document.getElementById('quickExercise')
		.selectedOptions[0]?.text;

	const ex = QUICK_EXERCISES.find(
		x =>
			x.WorkoutArea === area &&
			x.ExerciseName === selectedName
	);

	if(!ex){
		return;
	}

	const fields =
		document.getElementById('quickFields');

	if(ex.ExerciseType === 'Weight'){

		fields.innerHTML =
			'<input id="quickSets" placeholder="Sets">' +
			'<input id="quickReps" placeholder="Reps">' +
			'<input id="quickWeight" placeholder="Weight">';

		return;
	}

	if(ex.ExerciseType === 'Bodyweight'){

		fields.innerHTML =
			'<input id="quickSets" placeholder="Sets">' +
			'<input id="quickReps" placeholder="Reps">';

		return;
	}

	if(ex.ExerciseType === 'Endurance'){

		let label =
			ex.DistanceUnit || 'Distance';

		if(label === 'Steps'){
			label = 'Step Count';
		}

		fields.innerHTML =
			`<input id="quickDistance" placeholder="${label}">`;

		return;
	}
}

function getQuickToday(){

	const d = new Date();

	return (
		d.getFullYear() +
		'-' +
		String(d.getMonth()+1).padStart(2,'0') +
		'-' +
		String(d.getDate()).padStart(2,'0')
	);
}

async function saveQuickEntry(){
	if(quickSaving) return;
	quickSaving = true;

	const area =
		document.getElementById('area').value;

	const selectedName =
		document.getElementById('quickExercise')
		.selectedOptions[0].text;

	const ex = QUICK_EXERCISES.find(
		x =>
			x.WorkoutArea === area &&
			x.ExerciseName === selectedName
	);

	if(!ex){
		quickSaving = false;
		return;
	}

	const belongsToWorkout = QUICK_WORKOUT.Exercises.some(x => String(x.ExerciseID) === String(ex.ExerciseID)
	);

	console.log('Current Workout:', QUICK_WORKOUT.PlanName);

	console.log('Exercise:', ex.ExerciseName);

	console.log('Belongs To Workout:', belongsToWorkout);

	let payload = {
		action:'saveWorkoutLog',
		UserCode:getUserCode(),
		WorkoutDate:getQuickToday(),
		PlanName: belongsToWorkout
			? QUICK_WORKOUT.PlanName
			: '',
		WorkoutArea:ex.WorkoutArea,
		ExerciseID:ex.ExerciseID,
		ExerciseName:ex.ExerciseName,
		ExerciseType:ex.ExerciseType
	};

	if(ex.ExerciseType === 'Weight'){

		payload.Sets =
			document.getElementById('quickSets').value || '';

		payload.Reps =
			document.getElementById('quickReps').value || '';

		payload.Weight =
			document.getElementById('quickWeight').value || '';
	}

	if(ex.ExerciseType === 'Bodyweight'){

		payload.Sets =
			document.getElementById('quickSets').value || '';

		payload.Reps =
			document.getElementById('quickReps').value || '';
	}

	if(ex.ExerciseType === 'Endurance'){

		const distance =
			document.getElementById('quickDistance').value || '';

		if(ex.ExerciseName === 'Steps'){

			payload.Sets = distance;

		}else{

			payload.Distance = distance;
			payload.DistanceUnit = ex.DistanceUnit;
		}
	}

	const saveButton =
		document.querySelector(
			'#quickModal .btn.save'
		);

	saveButton.disabled = true;
	saveButton.innerText = 'Processing...';

	try{

console.log(payload);

		await fetch(API,{
			method:'POST',
			body:JSON.stringify(payload)
		});

saveButton.innerText = 'Saved ✓';

setTimeout(() => {

	quickModal.style.display = 'none';

	location.reload();

	}, 800);

	}
	catch(err){
	
		saveButton.disabled = false;
	
		saveButton.innerText = 'Save';

		quickSaving = false;

		alert('Save Failed');
	}
}

initQuickEntry();