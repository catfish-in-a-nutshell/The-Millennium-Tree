function d(n) {
    return new Decimal(n)
}

addLayer("m", {
    name: "minute", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(60), // Can be a function that takes requirement increases into account
    resource: "minutes", // Name of prestige currency
    baseResource: "seconds", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("m", 12))
            mult = mult.mul(upgradeEffect("m", 12))
        mult = mult.mul(tmp.h.effect)
        mult = mult.mul(tmp.d.effect)
        mult = mult.mul(tmp.mo.effect)
        mult = mult.mul(tmp.mo.globalBoost)
        return mult
    },
    effect: () => player.m.points.add(1).cbrt(),
    effectDescription: () => `boost seconds gain by ${format(tmp.m.effect)}`,
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    upgrades: {
        11: {
            title: "MINUTE",
            description: "idk, like minutes boost seconds?",
            cost: d(2),
            effect: () => player.m.points.add(2.25).log(1.5),
            effectDisplay: () => `x${format(player.m.points.add(2.25).log(1.5))}`

        },

        12: {
            title: "Twelve Minutes",
            description: "minutes boost minutes",
            cost: d(12),
            effect: () => player.m.points.add(2).log(2),
            effectDisplay: () => `x${format(player.m.points.add(2).log(2))}`,
            unlocked: () => hasUpgrade("m", 11)
        }
    },
    passiveGeneration: () => {
        if (player.a.paused) return 0
        if (hasMilestone("h", 1)) return 5
        return hasMilestone("h", 0) ? 0.05 : 0
    },
    update(diff) {
        if (hasMilestone("mo", 0) && !player.a.paused) {
            player.m.points = player.m.points.add(d(1).mul(diff))
        }
    },
    autoUpgrade: () => hasMilestone("h", 0),
    hotkeys: [
        {key: "m", description: "m: Reset for minutes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

addLayer("h", {
    name: "hour", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#f0932b",
    requires: new Decimal(60), // Can be a function that takes requirement increases into account
    base: d(10),
    resource: "hours", // Name of prestige currency
    baseResource: "minutes", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.75, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone("h", 2))
            mult = mult.div(tmp.h.milestonesH2Eff)
        return mult
    },
    directMult: () => {
        let mult = tmp.d.effect.mul(tmp.mo.effect)
        if (hasMilestone("mo", 3)) {
            mult = mult.mul(tmp.mo.milestonesCnt)
        } 
        mult = mult.mul(tmp.mo.globalBoost)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    effect: () => player.h.points.add(1).sqrt(),
    effectDescription: () => `boost minutes and seconds by ${format(tmp.h.effect)}`,
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "h: Reset for hours", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    milestonesH2Eff() {
        if (player.m.points.lte(d(1e10))) return d(1)
        return player.m.points.div(d("1e10")).sqrt()
    },

    milestones: {
        0: {
            requirementDescription: "5 HOURS",
            effectDescription: "This magically automates Minutes.",
            done() { return player.h.points.gte(5) || hasMilestone("mo", 4) || hasMilestone("y", 0) }
        },
        1: {
            requirementDescription: "Another 5 HOURS",
            effectDescription: "This magically automates Minutes, but like 100x better.",
            done() { return player.h.points.gte(10) || hasMilestone("mo", 4) || hasMilestone("y", 0) },
            unlocked: () => hasMilestone("h", 0)
        },
        2: {
            requirementDescription: "4 x 5 HOURS",
            effectDescription: () => `Minutes exceeding 1e10 lower Hours requirement, Currently x${format(tmp.h.milestonesH2Eff)}<br>
                OK I know 1e10 minutes is already 317 years but nvm`,
            done() { return player.h.points.gte(20) || hasMilestone("mo", 4) || hasMilestone("y", 0) },
            unlocked: () => hasMilestone("h", 1)
        },
        
    },
    canBuyMax: () => true,
    autoPrestige: () => hasMilestone("mo", 6),
    resetsNothing: () => hasMilestone("mo", 6),

    layerShown(){return true},
    branches: [["m", "white", 4]]
})


addLayer("d", {
    name: "days", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        reset_countdown: 0
    }},
    color: "#eb4d4b",
    requires: new Decimal(24), // Can be a function that takes requirement increases into account
    resource: "days", // Name of prestige currency
    baseResource: "hours", // Name of resource prestige is based on
    baseAmount() {return player.h.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.mul(tmp.mo.effect)
        mult = mult.mul(tmp.mo.globalBoost)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "d: Reset for days", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
        0: {
            requirementDescription: "A SURPRISE",
            effectDescription: "This layer does not reset anything.<br>-- Otherwise the game would be too long! Let's make it short.",
            done() { return player.d.points.gte(1) || hasMilestone("y", 0) },
            unlocked: () => player.d.points.gte(1)
        },
        1: {
            requirementDescription: "SO MANY (1e70) DAYS",
            effectDescription: () => `Days boost <b>This is perfectly workiin</b> time. Currently x${format(tmp.d.days2GlobalBoost)}`,
            done() { return player.d.points.gte(d("1e70")) },
            unlocked: () => player.y.points.gte(10)
        },
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
            if (player.d.reset_countdown > 0) {
                return `${format(player.d.reset_countdown)}s cooldown before reset`
            }
        }],
        "blank",
        "milestones",
        "blank",
    ],
    
    onPrestige() {
        if (hasMilestone("mo", 3)) {
            player.d.reset_countdown = 15
        } else {
            player.d.reset_countdown = 30
        }
    },

    canReset() {
        if (player.d.reset_countdown > 0) return false
        return tmp.d.baseAmount.gte(tmp.d.requires)
    },

    update(diff) {
        if (player.d.reset_countdown >= 0 && !player.a.paused) {
            player.d.reset_countdown -= diff
        }
    },
    
    days2GlobalBoost: () => {
        if (hasUpgrade("y", 12)) {
            return player.d.points.add(2).log(2).add(2).log(2).add(2).log(2)
        }
        return player.d.points.add(2).log(2).add(2).log(2).add(2).log(2).add(2).log(2)
    },

    effect: () => player.d.points.add(2).div(2).sqrt(),
    effectDescription: () => `boost all prev time currencies by ${format(tmp.d.effect)}`,
    resetsNothing: true,
    passiveGeneration: () => hasMilestone("mo", 7) && !player.a.paused ? d(1) : d(0),
    layerShown(){return true},
    branches: [["h", "white", 4]]
})

addLayer("mo", {
    name: "months", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Mo", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#be2edd",
    requires: new Decimal(30), // Can be a function that takes requirement increases into account
    resource: "months", // Name of prestige currency
    base: () => d(20).sub(tmp.mo.milestonesJuneEff),
    baseResource: "days", // Name of resource prestige is based on
    baseAmount() {return player.d.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    directMult: () => tmp.mo.globalBoost,
    effect: () => player.mo.points.add(1).pow(1.5),
    effectDescription: () => `has some <em>powerfu effect</em> like x${format(tmp.mo.effect)}`,

    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "o: Reset for months", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    canBuyMax: false,
    milestonesCnt: () => {
        let cnt = 0
        for (let i = 0; i < 12; i++) {
            if (hasMilestone("mo", i)) {
                cnt += 1
            }
        }
        return d(cnt)
    },
    milestonesJuneEff: () => {
        if (!hasMilestone("mo", 5)) return d(0)
        return tmp.mo.milestonesCnt.sub(4)
    },
    milestones: {
        0: {
            requirementDescription: "January",
            effectDescription: "You passively gain 1 minute every second <br> (makes sense)",
            done() { return player.mo.points.gte(1) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(1)
        },
        1: {
            requirementDescription: "February",
            effectDescription: "No effect for this because the <em>powerfu effect</em> is too <em>powerfu</em>",
            done() { return player.mo.points.gte(2) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(2)
        },
        2: {
            requirementDescription: "March",
            effectDescription: "<em>powerfu</em>",
            done() { return player.mo.points.gte(3) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(3)
        },
        3: {
            requirementDescription: "April",
            effectDescription: () => `Still <em>powerfu</em> but 0.5x Days cooldown, boost Hours by Month milestones (x${format(tmp.mo.milestonesCnt)})`,
            done() { return player.mo.points.gte(4) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(4)
        },
        4: {
            requirementDescription: "May",
            effectDescription: () => `Keep Hours milestones at reset`,
            done() { return player.mo.points.gte(5) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(5)
        },
        5: {
            requirementDescription: "June",
            effectDescription: () => `Slightly decrease Months requirement base (-${format(tmp.mo.milestonesJuneEff)})`,
            done() { return player.mo.points.gte(6) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(6)
        },
        6: {
            requirementDescription: "July",
            effectDescription: () => `Automate Hours and it resets nothing.`,
            done() { return player.mo.points.gte(7) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(7)
        },
        7: {
            requirementDescription: "August",
            effectDescription: () => `Passively gain 100% of Days.`,
            done() { return player.mo.points.gte(8) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(8)
        },
        8: {
            requirementDescription: "September",
            effectDescription: () => `Omg it's already September`,
            done() { return player.mo.points.gte(9) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(9)
        },
        9: {
            requirementDescription: "October",
            effectDescription: () => `I haven't done anything I've planned in this year`,
            done() { return player.mo.points.gte(10) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(10)
        },
        10: {
            requirementDescription: "November",
            effectDescription: () => `OH NO THE YEAR IS OVER`,
            done() { return player.mo.points.gte(11) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(11)
        },
        11: {
            requirementDescription: "December",
            effectDescription: () => `IT IS COMING`,
            done() { return player.mo.points.gte(12) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(12)
        },
        12: {
            requirementDescription: "The 10000th Month",
            effectDescription: () => `Months boost <b>This is perfectly workiin</b> time. Currently x${format(tmp.mo.months2GlobalBoost)}`,
            done() { return player.mo.points.gte(10000) },
            unlocked: () => player.mo.points.gte(10000)
        }
    },
    layerShown(){return true},
    months2GlobalBoost: () => {
        if (hasUpgrade("y", 12)) {
            return player.mo.points.add(2).log(2).add(2).log(2)
        }
        return player.mo.points.add(2).log(2).add(2).log(2).add(2).log(2)
    },

    globalBoost() {
        // OK IT SHOULD NOT BE HERE BUT I DON'T CARE
        if (!hasMilestone("a", 1)) return d(1)
        return d(2).pow(player.a.global_boost_time.div(90))
    },
    resetsNothing: () => hasMilestone("y", 1),
    canBuyMax: () => hasMilestone("y", 3),
    autoPrestige: () => hasMilestone("y", 4),
    branches: [["d", "white", 4]]
})

addLayer("y", {
    name: "year", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Y", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4834d4",
    requires: new Decimal(12), // Can be a function that takes requirement increases into account
    resource: "years", // Name of prestige currency
    baseResource: "months", // Name of resource prestige is based on
    baseAmount() {return player.mo.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: d(2),
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    milestones: {
        0: {
            requirementDescription: "YEAR",
            effectDescription: "All previous layer milestones are kept forever.",
            done() { return player.y.points.gte(1) },
            unlocked: () => player.y.points.gte(1)
        },
        1: {
            requirementDescription: "3 Years",
            effectDescription: `I don't want those milestone popups anymore! <br>
                Months resets nothing.`,
            done() { return player.y.points.gte(3) },
            unlocked: () => player.y.points.gte(1)
        },
        2: {
            requirementDescription: "4 Years",
            effectDescription: `Years no longer resets <b>This is perfectly workiin</b> time.`,
            done() { return player.y.points.gte(4) },
            unlocked: () => player.y.points.gte(3)
        },
        3: {
            requirementDescription: "7 Years",
            effectDescription: `You can buy max months.`,
            done() { return player.y.points.gte(7) },
            unlocked: () => player.y.points.gte(5)
        },
        4: {
            requirementDescription: "Decade",
            effectDescription: `Months and Years are all automated.`,
            done() { return player.y.points.gte(10) },
            unlocked: () => player.y.points.gte(7)
        },
        5: {
            requirementDescription: "It's already year 2000???",
            effectDescription: "Everything is so fast. slow down everything by 100x",
            done() { return player.y.points.gte(2000) },
            unlocked: () => player.y.points.gte(2000)
        },
        6: {
            requirementDescription: "OH NO iTs Arleady 2020",
            effectDescription: "everrythg so fass!!!. slwwot down evrftyhing b 10x aggina",
            done() { return player.y.points.gte(2020) },
            unlocked: () => player.y.points.gte(2020)
        },
        7: {
            requirementDescription: "NO PLEASE NOOOO",
            effectDescription: "SLOWWWWWW DDOWWWNNNNNNNNN",
            done() { return player.y.points.gte(2021) },
            unlocked: () => player.y.points.gte(2021)
        },

    },
    upgrades: {
        11: {
            title: "3 Decades",
            description: "Years no longer resets anything, and autobuy max.",
            cost: d(30),
            unlocked: () => player.y.points.gte(10)
        },
        12: {
            title: "6 Decades",
            description: "<b>This is perfectly workiin</b> time boosts are better",
            cost: d(60),
            unlocked: () => player.y.points.gte(40)
        },
        13: {
            title: "Century",
            description: "Why don't we do this: player.devSpeed *= 10",
            cost: d(100),
            onPurchase() { player.devSpeed = player.devSpeed * 10 },
            unlocked: () => player.y.points.gte(100)
        },

    },
    autoPrestige: () => hasMilestone("y", 4),

    doReset() {
        if (!hasMilestone("y", 2))
            player.a.global_boost_time = d(0)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "y", description: "y: Reset for years", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    canBuyMax: () => hasUpgrade("y", 11),
    resetsNothing: () => hasUpgrade("y", 11),
    
    layerShown(){return true},
    branches: [["mo", "white", 4]]
})



addLayer("a", {
    name: "achievements",
    symbol: "A",
    position: 0,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            paused: false,
            global_boost_time: d(0)
        }
    },
    color: "#ffffff",
    
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "achievements", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    
    milestones: {
        0: {
            requirementDescription: "OK This is not gonna work",
            done() {return player.points.gte(10)},
            effectDescription: "devSpeed x6",
            onComplete() {player.devSpeed = 6}
        },
        1: {
            requirementDescription: "This is perfectly workiin",
            done() {return player.y.points.gte(1)},
            effectDescription: () => `Time passively BOOST everything GREATLY, x${format(tmp.mo.globalBoost)}`,
            onComplete() { player.global_boost_time = 0 },
            unlocked() {return player.y.points.gte(1)},
        }
    },

    update(diff) {
        if (hasMilestone("a", 1) && !player.a.paused) {
            let add_diff = d(diff)
            if (hasMilestone("mo", 12))
                add_diff = add_diff.mul(tmp.mo.months2GlobalBoost)
            if (hasMilestone("d", 1))
                add_diff = add_diff.mul(tmp.d.days2GlobalBoost)

            if (hasMilestone("y", 5))
                add_diff = add_diff.div(100)
            
            if (hasMilestone("y", 6))
                add_diff = add_diff.div(10)

            if (hasMilestone("y", 7))
                add_diff = add_diff.div(2)
            player.a.global_boost_time = player.a.global_boost_time.add(add_diff)
        }
    },

    tabFormat: ["milestones"],
    hotkeys: [{
        key: "w",
        description: "w: pause/resume the game",
        onPress() { player.a.paused = !player.a.paused }
    }],
    layerShown(){ return hasMilestone("a", 0) }
})