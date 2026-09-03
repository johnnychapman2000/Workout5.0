/* ========================================
   LEAD CHASE PAGE
   ======================================== */

const LEAD_CHASE_EXERCISES = {
    Biceps: [
        'DB Curls',
        'Preacher Curls',
        'Hammer Curls',
        'Cable Bar Curls',
        'Rope Cable Curls',
        'Incline Dumbell Curls'
    ],
    Triceps: [
        'Overhead bar dip',
        'Triceps Press',
        'Tricep Extension',
        'Cable Press down',
        'Push Down Rope',
        'Overhead Rope Extension',
        'DB Skull Crusher'
    ],
    Shoulders: [
        'Rear Deltoid',
        'Shoulder Press',
        'Shoulder Shrugs',
        'Lateral Raises',
        'Face Pull',
        'Upright Row',
        'Arnold Press'
    ]
};

document.addEventListener(
    'DOMContentLoaded',
    () => {
        console.log('LeadChase.js Loaded');
        initializeLeadChase();
    }
);

async function initializeLeadChase(){

    document.querySelector('.page-title').innerText = '🎯 Lead Chase';

    if(typeof buildNavigation === 'function'){
        document.getElementById('navigation').innerHTML =
            buildNavigation('leadchase');
    }

    await renderLeadChasePage();
}

async function renderLeadChasePage(){

    const summaryBox = document.getElementById('leadChaseSummary');
    const areasBox = document.getElementById('leadChaseAreas');
    const leadersBox = document.getElementById('currentlyLeadingAreas');

    try{

        const chase = await (
            await fetch(
                API +
                '?action=getLeadChase' +
                '&user=' + getUserCode() +
                '&t=' + Date.now()
            )
        ).json();

        const battle = await (
            await fetch(
                API +
                '?action=getBattleLines' +
                '&user=' + getUserCode() +
                '&t=' + Date.now()
            )
        ).json();

        renderLeadChaseSummary(chase, summaryBox);
        renderLeadChaseAreas(chase, battle, areasBox);
        renderCurrentlyLeading(battle, leadersBox);

    }
    catch(err){
        console.error('Lead Chase Page Failed:', err);
    }
}

function renderLeadChaseSummary(chase, box){

    if(!chase.length){
        box.innerHTML = 'No lead chase opportunities';
        return;
    }

    const closest = chase[0];

    const totalGain = chase.reduce(
        (sum,x) => sum + Number(x.Difference || 0),
        0
    );

    box.innerHTML = `
        <div class="kpi">
            <div class="kpi-label">🔥 Recommended Target</div>
            <div class="kpi-value">${closest.WorkoutArea}</div>
        </div>

        <div style="margin-top:12px;font-size:20px;font-weight:700;color:#ffb347;text-align:center;">
            Need ${Number(closest.Difference || 0).toLocaleString()} pts to take the lead
        </div>

        <div class="kpi-label" style="margin-top:10px;text-align:center;">
            ${totalGain.toLocaleString()} Points Available Across ${chase.length} Categories
        </div>
    `;
}

function renderLeadChaseAreas(chase,battle,box){

    let html='';

    chase.forEach(area=>{

        const battleArea = battle.find(
            x => x.WorkoutArea === area.WorkoutArea
        );

        if(!battleArea) return;

        const leftScore = Number(battleArea.LeftScore || 0);
        const rightScore = Number(battleArea.RightScore || 0);
        const total = leftScore + rightScore;

        const leftPct = total ? Math.round((leftScore / total) * 100) : 50;
        const rightPct = 100 - leftPct;

        const exercises = LEAD_CHASE_EXERCISES[area.WorkoutArea] || [];

        let exerciseHtml = '';

        exercises.forEach(exercise => {
            exerciseHtml += `<div class="pill">${exercise}</div>`;
        });

        html += `
            <div class="card">

                <div class="card-header">
                    <div class="card-title">
                        🎯 ${area.WorkoutArea}
                    </div>
                </div>

                <div class="battle-line-track" style="margin-top:16px;">
                    <div class="battle-line-center"></div>
                    <div class="battle-line-fill left" style="width:${leftPct}%"></div>
                    <div class="battle-line-fill right" style="width:${rightPct}%"></div>
                </div>

                <div class="battle-line-footer">
                    <span>${battleArea.LeftUserCode} ${leftScore.toLocaleString()}</span>
                    <span>${battleArea.RightUserCode} ${rightScore.toLocaleString()}</span>
                </div>

                <div style="margin-top:12px;font-size:18px;font-weight:700;color:#ffb347;">
                    Need ${Number(area.Difference || 0).toLocaleString()} pts
                </div>

                <div class="kpi-label" style="margin-top:12px;">
                    Recommended Exercises
                </div>

                <div class="pill-list">
                    ${exerciseHtml}
                </div>

            </div>
        `;
    });

    box.innerHTML = html;
}

function renderCurrentlyLeading(battle,box){

    const me = getUserCode();

    const leading = battle.filter(
        x => x.WorkoutArea &&
        x.WorkoutArea !== 'TOTAL VOLUME' &&
        x.LeaderUserCode === me
    );

    if(!leading.length){
        box.innerHTML = 'No leading areas yet';
        return;
    }

    let html = `
        <div class="kpi-label" style="margin-bottom:12px;">
            🏆 Leading ${leading.length} Categories
        </div>
    `;

    leading.forEach(x=>{
        html += `<div class="pill">${x.WorkoutArea}</div>`;
    });

    box.innerHTML = html;
}
