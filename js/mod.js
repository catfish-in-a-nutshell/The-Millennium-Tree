let modInfo = {
	name: "The Millennium Tree",
	id: "CatfishMillennium",
	author: "catfish",
	pointsName: "seconds",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1",
	name: "completely done",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added everything.<br>`

let winText = `Congratulations! You have reached the year 2022 and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return !player.a.paused
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	gain = gain.mul(tmp.m.effect)
	gain = gain.mul(tmp.h.effect)
	gain = gain.mul(tmp.d.effect)
	gain = gain.mul(tmp.mo.effect)
	gain = gain.mul(tmp.mo.globalBoost)
	if (hasUpgrade("m", 11))
		gain = gain.mul(upgradeEffect("m", 11))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	() => {
		if (player.a.paused) return "game paused (press w to resume)"
	},
	
	() => {
		return "Reach Year 2022 to complete!"
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.y.points.gte(new Decimal(2022))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}