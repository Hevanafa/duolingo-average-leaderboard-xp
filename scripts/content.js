/**
* This script adds the GUI to show the average XP within the leaderboard's ranks 1 to 25.
* By Hevanafa, 07-03-2024
*/

// Idea: "You're N XP short from the average."

console.log("Starting Average GUI...");

const averageGUI = {
	/** @type {HTMLSpanElement} */
	btnRefresh: undefined,
	/** @type {HTMLDivElement} */
	baseDiv: undefined,

	previousUrl: "",
	mutObserver: undefined,
	mutObserverConfig: { subtree: true, childList: true }
};

const debug = true;

function hasLeaderboard() {
	return !!document.querySelector("[data-test=\"leaderboard\"]");
}

function recalcAverage() {
	const leaderboardDiv = document.querySelector("[data-test=\"leaderboard\"]");

	if (!leaderboardDiv) {
		if (debug)
			console.warn("Couldn't find the leaderboard div!");
		
		return;
	}
	
	const XPList = [...leaderboardDiv.querySelectorAll("a > span")]
		.map(span => span.innerText)
		.filter(s => s.includes("XP"))
		.slice(0, 25)
		.map(s => parseInt(s, 10));

	const sum = XPList.reduce((a, b) => a + b, 0);
	const average = sum / 25;
	
	averageGUI.baseDiv.innerHTML = `Average (ranks 1-25):<br/>${average} XP`;
	averageGUI.baseDiv.appendChild(averageGUI.btnRefresh);
}

function init() {
	averageGUI.baseDiv = document.createElement("div");
	averageGUI.btnRefresh = document.createElement("span");

	with (averageGUI.baseDiv) {
		id = "average-gui";

		style.position = "fixed";
		style.bottom = "20px";
		style.right = "20px";
		style.padding = "8px";
		style.borderRadius = "8px";
		style.zIndex = 1;

		// the same as the left navigational panel
		style.backgroundColor = "rgb(var(--color-snow))";
		style.border = "var(--web-ui_navbar-border-right,2px solid rgb(var(--color-swan)))";
	}

	with (averageGUI.btnRefresh) {
		innerText = "Refresh";
		style.fontWeight = "bold";
		// the same as the CLEAR button inside the status box
		style.color = "var(--web-ui_button-color,rgb(var(--color-macaw)))";
		style.marginLeft = "4px";
		style.cursor = "pointer";
		
		addEventListener("click", () => {
			recalcAverage();
		});
	}

	recalcAverage();
	document.body.appendChild(averageGUI.baseDiv);
}

let attempts = 0;
const t = window.setInterval(() => {
	if (hasLeaderboard()) {
		init();
		window.clearInterval(t);
	} else attempts++;

	if (attempts >= 60) {
		console.warn("Couldn't find the leaderboards div within the 60-second timeout.");
		window.clearInterval(t);
	}
}, 1000);

// Makes the GUI disappear when leaving the page because Duolingo uses SPA.
// https://stackoverflow.com/questions/37676526/
averageGUI.mutObserver = new MutationObserver(mut => {
	if (window.location.href !== averageGUI.previousUrl) {
		averageGUI.previousUrl = window.location.href;
		
		if (window.location.href === "https://www.duolingo.com/leaderboard") {
			// add the element
			document.body.appendChild(averageGUI.baseDiv);
		} else if (document.body.contains(averageGUI.baseDiv)) {
			// remove the element
			document.body.removeChild(averageGUI.baseDiv);
		}
	}
});

averageGUI.mutObserver.observe(document, averageGUI.mutObserverConfig);
