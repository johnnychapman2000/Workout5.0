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

	sets.value = '';
	reps.value = '';
	weight.value = '';

	sets.style.display = 'block';
	reps.style.display = 'block';
	weight.style.display = 'block';

	sets.placeholder = 'Sets';
	reps.placeholder = 'Reps';
	weight.placeholder = 'Weight';

	if(CE.ExerciseType === 'Bodyweight'){
		weight.style.display = 'none';
	}

	if(CE.ExerciseType === 'Duration'){
		weight.placeholder = 'Duration (seconds)';
	}

	if(CE.ExerciseType === 'Endurance'){
		sets.placeholder = 'Distance';
		reps.style.display = 'none';
		weight.style.display = 'none';
	}

	workoutModal.style.display = 'block';
}


function openSteps(){

	CE = {
		ExerciseID:41,
		ExerciseName:'Steps',
		ExerciseType:'Endurance',
		WorkoutArea:'Cardio',
		DistanceUnit:'Steps'
	};

	ename.innerText = 'Steps';

	sets.value = '';
	reps.value = '';
	weight.value = '';

	sets.style.display = 'block';
	sets.placeholder = 'Steps Count';

	reps.style.display = 'none';
	weight.style.display = 'none';

	workoutModal.style.display = 'block';
}


function closeWorkout(){

	workoutModal.style.display = 'none';

	sets.value = '';
	reps.value = '';
	weight.value = '';

	sets.style.display = 'block';
	reps.style.display = 'block';
	weight.style.display = 'block';

	sets.placeholder = 'Sets';
	reps.placeholder = 'Reps';
	weight.placeholder = 'Weight';
}


async function saveExercise(){

	if(saving) return;

	saving = true;

	saveBtn.disabled = true;
	saveBtn.innerText = 'Processing...';

	const isEndurance =
		CE &&
		CE.ExerciseType === 'Endurance';

	const payload = {
		action:'saveWorkoutLog',
		UserCode:getUserCode(),
		WorkoutDate:getToday(),
		PlanName:CW.PlanName,
		WorkoutArea:CE ? CE.WorkoutArea : '',
		ExerciseID:CE ? CE.ExerciseID : '',
		ExerciseName:CE ? CE.ExerciseName : '',
		ExerciseType:CE ? CE.ExerciseType : '',
		Sets:isEndurance ? '' : sets.value || '',
		Reps:isEndurance ? '' : reps.value || '',
		Weight:isEndurance ? '' : weight.value || '',
		Distance:isEndurance ? Number(sets.value || 0) : '',
		DistanceUnit:isEndurance
			? (CE.DistanceUnit || '')
			: ''
	};

	try{

		const response =
			await fetch(API,{
				method:'POST',
				body:JSON.stringify(payload)
			});

		saveBtn.innerText = 'Saved ✓';

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

		setTimeout(() => {
			location.reload();
		},800);

	}
	catch(err){

		console.error(
			'SAVE FAILED',
			err
		);

		saveBtn.disabled = false;
		saveBtn.innerText = 'Save Workout';
		saving = false;
	}
}
