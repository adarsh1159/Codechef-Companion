let contests=[];
let solvedProblems=new Set();
let attemptedProblems=new Set();

const problemLetters=["A","B","C","D","E","F","G","H","I","J"];

const searchInput=document.getElementById("searchInput");
const indexFilter=document.getElementById("indexFilter");
const ratingFilter=document.getElementById("ratingFilter");
const contestBody=document.getElementById("contestBody");
const emptyState=document.getElementById("emptyState");

const usernameInput=document.getElementById("usernameInput");
const syncButton=document.getElementById("syncButton");

async function loadContests(){
    try{
        const response=await fetch("contests.json");

        if(!response.ok){
            throw new Error("Failed to load contests.json");
        }

        contests=await response.json();

        contests=contests.filter(contest=>{
            return contest.problems&&contest.problems.length>0;
        });

        contests.sort((a,b)=>{
            const numA=parseInt(String(a.contest||"").replace(/\D/g,""))||0;
            const numB=parseInt(String(b.contest||"").replace(/\D/g,""))||0;

            return numB-numA;
        });

        displayContests();

    }catch(error){
        console.error("Contest loading error:",error);

        contestBody.innerHTML=`
            <tr>
                <td colspan="11" class="error-cell">
                    Failed to load contests.
                </td>
            </tr>
        `;
    }
}


function getRatingClass(rating){

    if(!rating||rating<=0){
        return "";
    }

    if(rating<1000){
        return "easy";
    }

    if(rating<1400){
        return "medium";
    }

    if(rating<1800){
        return "hard";
    }

    return "very-hard";
}


function getContestName(contest){
    return contest.name||contest.contest||"Unknown Contest";
}


function getContestUrl(contest){
    return contest.contestUrl||contest.url||"#";
}


function getProblemCode(problem){

    return String(
        problem.code||
        problem.problemCode||
        problem.slug||
        ""
    ).toUpperCase();

}


function getProblemStatus(problem){

    const code=getProblemCode(problem);

    if(!code){
        return "unattempted";
    }

    if(solvedProblems.has(code)){
        return "solved";
    }

    if(attemptedProblems.has(code)){
        return "attempted";
    }

    return "unattempted";
}


function matchesSearch(contest,problem,search){

    if(!search){
        return true;
    }

    const contestName=getContestName(contest).toLowerCase();

    const contestCode=String(
        contest.contest||""
    ).toLowerCase();

    const problemName=String(
        problem.name||""
    ).toLowerCase();

    const letter=String(
        problem.letter||""
    ).toLowerCase();

    const code=getProblemCode(problem).toLowerCase();

    return contestName.includes(search)||
           contestCode.includes(search)||
           problemName.includes(search)||
           code.includes(search)||
           letter===search;
}


function matchesRating(problem,ratingLimit){

    if(ratingLimit==="all"){
        return true;
    }

    const rating=Number(problem.rating)||0;

    if(rating===0){
        return false;
    }

    return rating<=Number(ratingLimit);
}


function createProblemCell(problem){

    if(!problem){
        return `
            <td>
                <div class="no-problem">—</div>
            </td>
        `;
    }

    const rating=Number(problem.rating)||0;

    const ratingText=rating>0?rating:"N/A";

    const ratingClass=getRatingClass(rating);

    const status=getProblemStatus(problem);

    const problemUrl=problem.url||"#";

    const editorialUrl=problem.editorialUrl;

    return `
        <td class="problem-${status}">

            <div class="problem-card">

                <div class="problem-letter">
                    ${escapeHTML(problem.letter||"")}
                </div>

                <div class="problem-name">
                    ${escapeHTML(problem.name||"Unnamed Problem")}
                </div>

                <div class="rating ${ratingClass}">
                    <span class="star-icon">★</span>
                    ${ratingText}
                </div>

                <div class="action-links">

                    ${
                        problemUrl!=="#"
                        ?
                        `
                        <a
                            class="problem-btn"
                            href="${problemUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Problem ↗
                        </a>
                        `
                        :
                        ""
                    }

                    ${
                        editorialUrl
                        ?
                        `
                        <a
                            class="editorial-btn"
                            href="${editorialUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Editorial ↗
                        </a>
                        `
                        :
                        ""
                    }

                </div>

            </div>

        </td>
    `;
}


function displayContests(){

    const search=searchInput.value.trim().toLowerCase();

    const selectedIndex=indexFilter.value;

    const selectedRating=ratingFilter.value;

    contestBody.innerHTML="";

    let visibleContestCount=0;

    let visibleProblemCount=0;

    contests.forEach(contest=>{

        const problems=Array.isArray(contest.problems)
            ?contest.problems
            :[];

        const problemMap={};

        problems.forEach(problem=>{

            if(!problem){
                return;
            }

            const letter=String(
                problem.letter||""
            ).toUpperCase();

            if(!problemLetters.includes(letter)){
                return;
            }

            if(
                selectedIndex!=="all"&&
                letter!==selectedIndex
            ){
                return;
            }

            if(
                !matchesSearch(
                    contest,
                    problem,
                    search
                )
            ){
                return;
            }

            if(
                !matchesRating(
                    problem,
                    selectedRating
                )
            ){
                return;
            }

            problemMap[letter]=problem;

        });

        const visibleProblems=Object.values(problemMap);

        if(visibleProblems.length===0){
            return;
        }

        visibleContestCount++;

        visibleProblemCount+=visibleProblems.length;

        const row=document.createElement("tr");

        const contestCell=document.createElement("td");

        contestCell.className=
            "contest-cell contest-column";

        const contestUrl=getContestUrl(contest);

        contestCell.innerHTML=`
            <a
                class="contest-link"
                href="${contestUrl}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${escapeHTML(getContestName(contest))}
            </a>
        `;

        row.appendChild(contestCell);

        problemLetters.forEach(letter=>{

            if(
                selectedIndex!=="all"&&
                letter!==selectedIndex
            ){

                row.innerHTML+=`
                    <td>
                        <div class="no-problem">—</div>
                    </td>
                `;

                return;
            }

            const problem=problemMap[letter];

            row.innerHTML+=createProblemCell(problem);

        });

        contestBody.appendChild(row);

    });

    document.getElementById("contestCount").textContent=
        visibleContestCount;

    document.getElementById("problemCount").textContent=
        visibleProblemCount;

    if(visibleContestCount===0){
        emptyState.style.display="block";
    }else{
        emptyState.style.display="none";
    }

}


async function syncProfile(){

    const username=usernameInput.value.trim();

    if(!username){
        alert("Please enter your CodeChef username.");
        return;
    }

    syncButton.disabled=true;

    syncButton.textContent="Syncing...";

    document.getElementById("syncStatus").textContent=
        "Fetching submissions...";

    try{

        const response=await fetch(
            `/api/profile/${encodeURIComponent(username)}`
        );

        const data=await response.json();

        if(!response.ok){
            throw new Error(
                data.error||"Failed to fetch profile"
            );
        }

        solvedProblems=new Set(
            (data.solved||[]).map(code=>
                String(code).toUpperCase()
            )
        );

        attemptedProblems=new Set(
            (data.attempted||[]).map(code=>
                String(code).toUpperCase()
            )
        );

        // A solved problem should never remain attempted
        solvedProblems.forEach(code=>{
            attemptedProblems.delete(code);
        });

        localStorage.setItem(
            "codechefUsername",
            username
        );

        localStorage.setItem(
            "codechefSolved",
            JSON.stringify([...solvedProblems])
        );

        localStorage.setItem(
            "codechefAttempted",
            JSON.stringify([...attemptedProblems])
        );

        document.getElementById(
            "profileUsername"
        ).textContent=username;

        document.getElementById(
            "solvedCount"
        ).textContent=solvedProblems.size;

        document.getElementById(
            "attemptedCount"
        ).textContent=attemptedProblems.size;

        const totalProblems=getTotalProblems();

        document.getElementById(
            "unattemptedCount"
        ).textContent=
            Math.max(
                0,
                totalProblems-
                solvedProblems.size-
                attemptedProblems.size
            );

        document.getElementById(
            "profileInfo"
        ).classList.remove("hidden");

        document.getElementById(
            "syncStatus"
        ).textContent=
            `Synced ${new Date().toLocaleTimeString()}`;

        displayContests();

    }catch(error){

        console.error(
            "Profile sync error:",
            error
        );

        document.getElementById(
            "syncStatus"
        ).textContent="Sync failed";

        alert(
            error.message||
            "Unable to fetch CodeChef profile."
        );

    }finally{

        syncButton.disabled=false;

        syncButton.textContent="Sync Profile";

    }

}


function getTotalProblems(){

    let count=0;

    contests.forEach(contest=>{

        if(
            Array.isArray(contest.problems)
        ){
            count+=contest.problems.length;
        }

    });

    return count;
}


function loadSavedProfile(){

    const username=
        localStorage.getItem(
            "codechefUsername"
        );

    const savedSolved=
        localStorage.getItem(
            "codechefSolved"
        );

    const savedAttempted=
        localStorage.getItem(
            "codechefAttempted"
        );

    if(username){
        usernameInput.value=username;
    }

    if(savedSolved){

        solvedProblems=new Set(
            JSON.parse(savedSolved)
        );

    }

    if(savedAttempted){

        attemptedProblems=new Set(
            JSON.parse(savedAttempted)
        );

    }

    if(username&&(savedSolved||savedAttempted)){

        document.getElementById(
            "profileUsername"
        ).textContent=username;

        document.getElementById(
            "solvedCount"
        ).textContent=
            solvedProblems.size;

        document.getElementById(
            "attemptedCount"
        ).textContent=
            attemptedProblems.size;

        document.getElementById(
            "unattemptedCount"
        ).textContent=
            Math.max(
                0,
                getTotalProblems()-
                solvedProblems.size-
                attemptedProblems.size
            );

        document.getElementById(
            "profileInfo"
        ).classList.remove("hidden");

        document.getElementById(
            "syncStatus"
        ).textContent=
            "Loaded from saved data";

    }

}


function escapeHTML(value){

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


searchInput.addEventListener(
    "input",
    displayContests
);

indexFilter.addEventListener(
    "change",
    displayContests
);

ratingFilter.addEventListener(
    "change",
    displayContests
);

syncButton.addEventListener(
    "click",
    syncProfile
);

usernameInput.addEventListener(
    "keydown",
    event=>{
        if(event.key==="Enter"){
            syncProfile();
        }
    }
);


loadContests().then(()=>{
    loadSavedProfile();
    displayContests();
});