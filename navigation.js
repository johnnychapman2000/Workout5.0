function buildNavigation(activePage){
	return `
	<div class="navwrap">

		<div
			class="fab"
			onclick="openQuickEntry()">
			+
		</div>

		<div class="nav">

			<a ${activePage==='home'?'class="active"':''}
				href="index.html">
				🏠<br>Home
			</a>

			<a ${activePage==='history'?'class="active"':''}
				href="history.html">
				📜<br>History
			</a>

			<span style="width:20%"></span>

			<a ${activePage==='stats'?'class="active"':''}
				href="stats.html">
				📊<br>Stats
			</a>

			<a ${activePage==='workout'?'class="active"':''}
				href="workout.html">
				💪<br>Workout
			</a>

		</div>

	</div>`;
}