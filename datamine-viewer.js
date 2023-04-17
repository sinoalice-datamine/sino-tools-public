const collator = new Intl.Collator('en');

let db = {
	json: new Map(),
	index: {
		EN: {},
		JP: {},
		characters: null,
		cards: null,
		skills: null,
	},
};

const cardType_weapon = 1;
const cardType_armor = 2;
const cardType_nightmare = 3;
const cardType_upgradeExp = 5; // upgrade sword/shield/tablet
const cardType_gold = 6;
const cardType_skillExp = 7; // gem (story, story support, colo, colo support)

const cardDetailType_weapon_instrument = 1;
const cardDetailType_weapon_tome = 2;
const cardDetailType_weapon_artifact = 3;
const cardDetailType_weapon_staff = 4;
const cardDetailType_weapon_sword = 5;
const cardDetailType_weapon_hammer = 6;
const cardDetailType_weapon_projectile = 7;
const cardDetailType_weapon_polearm = 8;
const cardDetailType_armor_head = 21;
const cardDetailType_armor_body = 22;
const cardDetailType_armor_feet = 23;
const cardDetailType_armor_hand = 24;

const attribute_fire = 1;
const attribute_water = 2;
const attribute_wind = 3;

const cardDetailTypeWeapon_strings = [
	"instrument",
	"tome",
	"artifact",
	"staff",
	"sword",
	"hammer",
	"projectile",
	"polearm",
];

const attribute_strings = [
	"Fire",
	"Water",
	"Wind",
];

const rarityMap = ["D", "C", "B", "A", "S", "SR", "L", "LL"];
const rarityToIdx = { D: 0, C: 1, B: 2, A: 3, S: 4, SR: 5, L: 6, LL: 7 };
const RARITY_LEVELS = [0, 0, 0, 40, 50, 60, 80, 100];
const RARITY_LB_LEVELS = [5, 5, 5, 5, 5, 5, 10, 10];

function viewClasses(db, character_mst_list, character_ability_mst_list, isDebug) {
	db.index.characters = new Map();

	let characters = db.index.characters;

	// Build indices.
	for (let i = 0; i < character_mst_list.length; i++) {
		let character_mst = character_mst_list[i];
		characters.set(character_mst.characterMstId, {
			mst: character_mst,
			skills: [],
		});
	}

	for (let i = 0; i < character_ability_mst_list.length; i++) {
		let character_ability_mst = character_ability_mst_list[i];
		let c = characters.get(character_ability_mst.characterMstId);
		c.skills.push(character_ability_mst);
	}

	let totalStats = [0, 0, 0, 0, 0, 0, 0];
	const skillType_names = ["", "Common", "Class", "Support", "Support"];

	let heading = "<h1>Units (character/class)</h1>";

	let unitSections = ""
	for (const [k, v] of characters) {
		unitSections += `<section id="${v.mst.characterMstId}">`;

		unitSections += '<div class="row">';
		unitSections += '<div class="col">';
		unitSections += `<h2>${v.mst.name}</h2>`;
		if (v.mst.displayStartTime) {
			const date = new Date(v.mst.displayStartTime * 1000);
			unitSections += `<p>Display start time: ${date.toISOString()}</p>`;
		}
		unitSections += '</div>';
		unitSections += '</div>';

		// 1: hp, 2: patk, 3: pdef, 4: matk, 5: mdef, 6: weapon, 7: cost
		let stats = {
			base:    [0, 0, 0, 0, 0, 0, 0],
			arcana1: [0, 0, 0, 0, 0, 0, 0],
			arcana2: [0, 0, 0, 0, 0, 0, 0],
			arcana3: [0, 0, 0, 0, 0, 0, 0],
			arcana4: [0, 0, 0, 0, 0, 0, 0],
			arcana5: [0, 0, 0, 0, 0, 0, 0],
		};

		unitSections += '<div class="row">';

		unitSections += '<div class="col">';
		{
			unitSections += '<table class="table table-striped table-bordered table-hover table-sm">';

			unitSections += '<thead class="table-light">';
			unitSections += '<tr>';
			if (isDebug) {
				unitSections += '<th>id</th>';
				unitSections += '<th>releaseLevel</th>';
				unitSections += '<th>skillType_name</th>';
				unitSections += '<th>name</th>';
				unitSections += '<th>skillType</th>';
				unitSections += '<th>effectType</th>';
				unitSections += '<th>effectValue</th>';
				unitSections += '<th>cardDetailType</th>';
			} else {
				unitSections += '<th>level</th>';
				unitSections += '<th>type</th>';
				unitSections += '<th>effect</th>';
			}
			unitSections += '</tr>';
			unitSections += '</thead>';

			unitSections += '<tbody>';
			for (let i = 0; i < v.skills.length; i++) {
				let skill = v.skills[i];
				unitSections += '<tr>';
				if (isDebug) {
					unitSections += `<td>${skill.characterAbilityMstId}</td>`;
				}
				unitSections += `<td>${skill.releaseLevel}</td>`;
				unitSections += `<td>${skillType_names[skill.skillType]}</td>`;
				unitSections += `<td>${skill.name}</td>`;
				if (isDebug) {
					unitSections += `<td>${skill.skillType}</td>`;
					unitSections += `<td>${skill.effectType}</td>`;
					unitSections += `<td>${skill.effectValue}</td>`;
					unitSections += `<td>${skill.cardDetailType}</td>`;
				}
				unitSections += '</tr>';
				if (skill.skillType == 1 || skill.skillType == 2) {
					let unlock = null;
					if (skill.releaseLevel <= 10) {
						unlock = stats.base
					} else if (skill.releaseLevel <= 12) {
						unlock = stats.arcana1;
					} else if (skill.releaseLevel <= 14) {
						unlock = stats.arcana2;
					} else if (skill.releaseLevel <= 16) {
						unlock = stats.arcana3;
					} else if (skill.releaseLevel <= 18) {
						unlock = stats.arcana4;
					} else {
						unlock = stats.arcana5;
					}
					unlock[skill.effectType - 1] += skill.effectValue;
					totalStats[skill.effectType - 1] += skill.effectValue;
				}
			}
			unitSections += '</tbody>';
			unitSections += '</table>';
		}
		unitSections += '</div>';

		unitSections += '<div class="col">';
		{
			unitSections += '<table class="table table-striped table-bordered table-hover table-sm">';

			unitSections += '<thead class="table-light">';
			unitSections += '<tr>';
			unitSections += '<th>unlock</th>';
			unitSections += '<th>HP</th>';
			unitSections += '<th>patk</th>';
			unitSections += '<th>pdef</th>';
			unitSections += '<th>matk</th>';
			unitSections += '<th>mdef</th>';
			unitSections += '<th>cost</th>';
			unitSections += '</tr>';
			unitSections += '</thead>';

			unitSections += '<tbody>';
			for (let k in stats) {
				let unlock = stats[k];
				unitSections += '<tr>';
				unitSections += `<td>${k}</td>`;
				for (let i = 0; i < unlock.length; i++) {
					if (i == 5) continue;
					if (unlock[i] != 0) {
						unitSections += `<td>${unlock[i]}</td>`;
					} else {
						unitSections += '<td></td>';
					}
				}
				unitSections += '</tr>';
			}
			unitSections += '</tbody>';

			unitSections += '</table>';
		}
		unitSections += '</div>';

		unitSections += '</div>';

		unitSections += '</section>';
	}

	let totalStatsSection = "";
	totalStatsSection += '<div class="row">';
	totalStatsSection += '<div class="col">';
	totalStatsSection += '<h2>Total stats</h2>';
	totalStatsSection += '<ul>';
	totalStatsSection += `<li>Number of units: ${characters.size}</li>`;
	totalStatsSection += `<li>HP: ${totalStats[0]}</li>`;
	totalStatsSection += `<li>patk: ${totalStats[1]}</li>`;
	totalStatsSection += `<li>pdef: ${totalStats[2]}</li>`;
	totalStatsSection += `<li>matk: ${totalStats[3]}</li>`;
	totalStatsSection += `<li>mdef: ${totalStats[4]}</li>`;
	totalStatsSection += `<li>cost: ${totalStats[6]}</li>`;
	totalStatsSection += '</ul>';
	totalStatsSection += '</div>';
	totalStatsSection += '</div>';

	let content = document.getElementById("content");
	content.innerHTML = heading + totalStatsSection + unitSections;

	return "Datamine viewer - units";
}

function getMultiplierText(mult, multName) {
	let res = "";
	if (!mult)
		return res;

	if (mult.base && mult.base[multName]) {
		res += mult.base[multName];
	}

	if (mult.alt && mult.alt[multName]) {
		res += `(${mult.alt[multName]})`;
	}

	return res;
}

async function indexCardsByUniqueId(index, cardMstList_promise) {
	let cardsByUniqueId = index.cardsByUniqueId;
	if (cardsByUniqueId)
		return cardsByUniqueId;

	cardsByUniqueId = {};
	const cardMstList = await cardMstList_promise;
	for (const card_mst of cardMstList) {
		card_mst.name = card_mst.name.trim();
		if (!card_mst.isRelease) {
			continue;
		}
		let card = cardsByUniqueId[card_mst.cardUniqueId];
		if (!card) {
			card = {
				uniqueId: card_mst.cardUniqueId,
				name: card_mst.name,
				variants: [],
			};
			cardsByUniqueId[card_mst.cardUniqueId] = card;
		}
		card.variants.push(card_mst);
	}

	for (const cardUniqueId in cardsByUniqueId) {
		const card = cardsByUniqueId[cardUniqueId];
		card.variants.sort(function(a, b) {
			if (a.evolutionLevel != b.evolutionLevel)
				return a.evolutionLevel - b.evolutionLevel;

			return a.cardMstId - b.cardMstId;
		});
	}

	index.cardsByUniqueId = cardsByUniqueId;
	return cardsByUniqueId;
}

async function indexCardsByName(index, cardsByUniqueId_promise) {
	let cardsByName = index.cardsByName;
	if (cardsByName)
		return cardsByName;

	cardsByName = {};
	const cardsByUniqueId = await cardsByUniqueId_promise;
	for (const cardUniqueId in cardsByUniqueId) {
		const card = cardsByUniqueId[cardUniqueId];
		cardsByName[card.name] = card;
	}

	index.cardsByName = cardsByName;
	return cardsByName;
}

async function indexSkillsById(index, version, skillMstList_promise, skillMultipliersBlue_promise) {
	let skillsById = index.skillsById;
	if (skillsById)
		return skillsById;

	skillsById = {};
	const skillMstList = await skillMstList_promise;
	for (const skill of skillMstList) {
		skillsById[skill.skillMstId] = skill;
	}

	const skillMultipliersBlue = await skillMultipliersBlue_promise;
	for (const mult of skillMultipliersBlue) {
		const skill = skillsById[mult.skillMstId];
		skill.mult = mult;

		// TODO: Support JP skills.
		if (version == "EN") {
			if (skill.rangeIcon == 1) {
				skill.mult.base.targetsMin = 1;
				skill.mult.base.targetsMax = 1;
			} else if (skill.rangeIcon == 3) {
				const regex = /(\d) (?:ally|allies|enemies)/;
				let match = regex.exec(skill.description);
				let targetCount = match[1]|0;
				skill.mult.base.targetsMin = targetCount;
				skill.mult.base.targetsMax = targetCount;
			} else if (skill.rangeIcon == 2) {
				const regex = /(\d) (?:to|or) (\d)/;
				let match = regex.exec(skill.description);
				skill.mult.base.targetsMin = match[1]|0;
				skill.mult.base.targetsMax = match[2]|0;
			}
		}
	}

	index.skillsById = skillsById;
	return skillsById;
}

function viewWeapons(version, db, cardsByUniqueId, skillsById, isDebug) {
	let weaponList = [];
	for (const cardUniqueId in cardsByUniqueId) {
		const card = cardsByUniqueId[cardUniqueId];
		if (card.variants[0].cardType == cardType_weapon)
			weaponList.push(card);
	}

	weaponList.sort(function(a, b) {
		let variantA = a.variants[a.variants.length - 1];
		let variantB = b.variants[b.variants.length - 1];
		if (variantA.isInfiniteEvolution) {
			if (variantB.isInfiniteEvolution)
				return variantA.name.localeCompare(variantB.name);
			else
				return -1;
		} else if (variantB.isInfiniteEvolution) {
			return 1;
		} else {
			let skillA = skillsById[variantA.frontSkillMstId];
			let skillB = skillsById[variantB.frontSkillMstId];
			if (skillA && skillB)
			{
				let nameOrder = skillA.name.localeCompare(skillB.name);
				if (nameOrder != 0)
					return nameOrder;
			}

			return variantA.frontSkillMstId - variantB.frontSkillMstId;
		}
	});

	let html = "<h1>Weapons</h1>";

	html += '<table class="table table-bordered text-nowrap table-sm"><thead><tr>';

	html += '<thead class="table-light sticky-top">';
	html += '<tr>';
	if (isDebug) {
		html += '<th>cardUniqueId</th>';
		html += '<th>cardMstId</th>';
	}
	html += '<th>name</th>';
	html += '<th>rarity</th>';
	if (isDebug) {
		html += '<th>isRelease</th>';
		html += '<th>roleType</th>';
		html += '<th>cardType</th>';
		html += '<th>cardDetailType</th>';
		html += '<th>weaponType</th>';
		html += '<th>attribute</th>';
	}
	if (isDebug) {
		html += '<th>autoSkillMstId</th>';
	}
	html += '<th>Colosseum Support</th>';
	if (isDebug) {
		html += '<th>frontSkillMstId</th>';
	}
	html += '<th>Colosseum</th>';
	html += '<th>SP</th>'
	html += '<th>targets</th>';
	html += '<th>damage</th>'
	html += '<th>recovery</th>'
	html += '<th>patk</th>'
	html += '<th>matk</th>'
	html += '<th>pdef</th>'
	html += '<th>mdef</th>'
	if (isDebug) {
		html += '<th>questSkillMstId</th>';
		html += '<th>limitBreakSkillMstId</th>';
	}
	html += '</tr>';
	html += '</thead>';

	html += '<tbody>';
	for (const weapon of weaponList) {
		for (let i = 0; i < weapon.variants.length; i++) {
			let variant = weapon.variants[i];

			html += '<tr>';

			if (isDebug) {
				html += `<td>${variant.cardUniqueId}</td>`;
				html += `<td>${variant.cardMstId}</td>`;
			}

			// name
			if (i == 0) {
				html += `<td rowspan="${weapon.variants.length}">${variant.name}</td>`;
			}

			// rarity
			html += `<td>${rarityMap[variant.rarity]}`;
			if (variant.isInfiniteEvolution) {
				html += ` (${variant.evolutionLevel}/${weapon.variants.length - 1})`;
			}
			html += `</td>`

			if (isDebug) {
				html += `<td>${variant.isRelease}</td>`;
				html += `<td>${variant.roleType}</td>`;
				html += `<td>${variant.cardType}</td>`;
				html += `<td>${variant.cardDetailType}</td>`;
				html += `<td>${variant.weaponType}</td>`;
				html += `<td>${variant.attribute}</td>`;
			}

			if (isDebug) {
				html += `<td>${variant.autoSkillMstId}</td>`;
			}
			let autoSkill = skillsById[variant.autoSkillMstId];
			html += "<td>";
			if (autoSkill)
				html += autoSkill.name;
			else
				html += "undef"
			html += "</td>";

			let frontSkill = skillsById[variant.frontSkillMstId];
			if (isDebug) {
				let note = (variant.backSkillMstId && variant.frontSkillMstId != variant.backSkillMstId)
					? " different back skill" : "";
				html += `<td>${variant.frontSkillMstId}${note}</td>`;
			}
			if (frontSkill) {
				let targetsText = "";
				if (version == "EN" && frontSkill.mult) {
					let baseTargetsMin = frontSkill.mult.base.targetsMin;
					let baseTargetsMax = frontSkill.mult.base.targetsMax;
					let altTargetsMin = baseTargetsMin;
					let altTargetsMax = baseTargetsMax;
					if (frontSkill.mult.alt) {
						if (frontSkill.mult.alt.targetsMin) {
							altTargetsMin = frontSkill.mult.alt.targetsMin;
						}
						if (frontSkill.mult.alt.targetsMax) {
							altTargetsMax = frontSkill.mult.alt.targetsMax;
						}
					}
					if (baseTargetsMin != baseTargetsMax) {
						targetsText += `${baseTargetsMin}-${baseTargetsMax}`;
					} else {
						targetsText += `${baseTargetsMin}`;
					}
					if (baseTargetsMin != altTargetsMin || baseTargetsMax != altTargetsMax) {
						targetsText += ' (';
						if (altTargetsMin != altTargetsMax) {
							targetsText += `${altTargetsMin}-${altTargetsMax}`;
						} else {
							targetsText += `${altTargetsMin}`;
						}
						targetsText += ')';
					}
				}
				html += `<td>${frontSkill.name}</td>`;
				html += `<td>${frontSkill.sp}</td>`;
				html += `<td>${targetsText}</td>`;
				html += `<td>${getMultiplierText(frontSkill.mult, 'damage')}</td>`;
				html += `<td>${getMultiplierText(frontSkill.mult, 'recovery')}</td>`;
				html += `<td>${getMultiplierText(frontSkill.mult, 'patk')}</td>`;
				html += `<td>${getMultiplierText(frontSkill.mult, 'matk')}</td>`;
				html += `<td>${getMultiplierText(frontSkill.mult, 'pdef')}</td>`;
				html += `<td>${getMultiplierText(frontSkill.mult, 'mdef')}</td>`;
			} else {
				html += `<td colspan="9">?undef?</td>`;
			}

			if (isDebug) {
				html += `<td>${variant.questSkillMstId}</td>`;
				html += `<td>${variant.limitBreakSkillMstId}</td>`;
			}
			html += '</tr>';
		}
	}
	html += '</tbody>';

	html += '</table>';

	let content = document.getElementById("content");
	content.innerHTML = html;

	return "Datamine viewer - weapons";
}

function viewNightmares(card_mst_list, art_mst_list, isDebug) {
	let art_mst_map = {};
	for (let i = 0; i < art_mst_list.length; i++) {
		const art = art_mst_list[i];
		art_mst_map[art.artMstId] = art;
	}

	let nightmare_mst_list = [];
	for (const card of card_mst_list) {
		if (card.cardType != cardType_nightmare)
			continue;

		if (!isDebug && !card.isRelease)
			continue;

		nightmare_mst_list.push(card);
	}

	let table_columns = [];
	if (isDebug) {
		table_columns.push({
			title: "cardMstId",
			field: "cardMstId",
			cmp: (l, r, col) => l.data.cardMstId - r.data.cardMstId,
		});
	}
	table_columns.push({
		title: "Name",
		field: "name",
		cmp: (l, r, col) => collator.compare(l.data.name, r.data.name),
	});
	table_columns.push({
		title: "Rarity",
		dataGenerator: (row) => rarityMap[row.rarity],
		cmp: (l, r, col) => l.data.rarity - r.data.rarity,
	});
	if (isDebug) {
		table_columns.push({
			title: "questArtMstId",
			field: "questArtMstId",
			cmp: (l, r, col) => l.data.questArtMstId - r.data.questArtMstId,
		});
	}
	table_columns.push({
		title: "Story skill",
		dataGenerator: (row) => {
			const storySkill = art_mst_map[row.questArtMstId];
			return storySkill ? storySkill.name : "undef";
		},
		cmp: (l, r, col) => collator.compare(l.dom.children[col].innerText, r.dom.children[col].innerText),
	});
	if (isDebug) {
		table_columns.push({
			title: "artMstId",
			field: "artMstId",
			cmp: (l, r, col) => l.data.artMstId - r.data.artMstId,
		});
	}
	table_columns.push({
		title: "Colosseum skill",
		dataGenerator: (row) => {
			const coloSkill = art_mst_map[row.artMstId];
			return coloSkill ? coloSkill.name : "undef";
		},
		cmp: (l, r, col) => collator.compare(l.dom.children[col].innerText, r.dom.children[col].innerText),
	});

	const table = {
		class: "table table-striped table-bordered table-hover table-sm",
		theadClass: "table-light sticky-top",
		data: nightmare_mst_list,
		columns: table_columns,
	};
	let content = document.getElementById("content");
	content.innerHTML = "<h1>Nightmares</h1>";
	content.appendChild(generateTable(table, {}));

	return "Datamine viewer - nightmares";
}

function viewSkills(skill_mst_list_en, skill_mst_list_jp, isDebug) {
	let skillMapJp = new Map();
	for (let i = 0; i < skill_mst_list_jp.length; i++) {
		let entry = skill_mst_list_jp[i];
		skillMapJp.set(entry.skillMstId, entry);
	}

	let html = '';
	html += '<h1>Skills</h1>';
	html += '<table class="table table-bordered table-sm">';

	html += '<thead class="table-light sticky-top">'
	html += '<tr>';
	html += '<th>skillMstId</th>';
	html += '<th>name</th>';
	html += '<th>description</th>';
	html += '</tr>';
	html += '</thead>';

	html += '<tbody>';
	for (let s = 0; s < skill_mst_list_en.length; s++) {
		let skill = skill_mst_list_en[s];
		let skill_jp = skillMapJp.get(skill.skillMstId);

		html += `<tr>`;
		if (skill_jp) {
			html += `<td rowspan="2">${skill.skillMstId}</td>`;
		} else {
			html += `<td>${skill.skillMstId}</td>`;
		}
		html += `<td>${skill.name}</td>`;
		html += `<td>${skill.description}</td>`;
		html += `</tr>`;

		if (skill_jp) {
			html += `<tr>`;
			html += `<td>${skill_jp.name}</td>`;
			html += `<td>${skill_jp.description}</td>`;
			html += `</tr>`;
		}
	}
	html += '</tbody>';

	html += '</table>';

	let content = document.getElementById("content");
	content.innerHTML = html;

	return "Datamine viewer - skills";
}

function viewWeaponmap(lists, isDebug) {
	// weaponssearch  | sino
	// ID             | cardMstId
	// UniqueID       | cardUniqueId

	// skill_mst_list[card_mst_list[ws.ID].frontSkillMstId].rates = ws.rate_text

	let weaponMap = new Map();
	let skillMap = new Map();
	{
		let card_mst_list_jp = lists.card_mst_list_jp;
		let card_mst_list_en = lists.card_mst_list_en;
		let ws_weapons = lists.weaponssearch_weapons;

		for (let i = 0; i < card_mst_list_jp.length; i++) {
			let entry = card_mst_list_jp[i];
			if (entry.cardType != cardType_weapon)
				continue;
			if (!weaponMap.has(entry.cardMstId)) {
				weaponMap.set(entry.cardMstId, { mst: entry, ws: null });
			} else {
				console.error(`duplicate cardMstId: ${entry.cardMstId}`);
			}
			if (!skillMap.has(entry.frontSkillMstId)) {
				skillMap.set(entry.frontSkillMstId, {jp: null, en: null, ws: null, blue: null});
			}
		}
		for (let i = 0; i < card_mst_list_en.length; i++) {
			let entry = card_mst_list_en[i];
			if (entry.cardType != cardType_weapon)
				continue;
			if (!skillMap.has(entry.frontSkillMstId)) {
				skillMap.set(entry.frontSkillMstId, {jp: null, en: null, ws: null, blue: null});
			}
		}

		for (let i = 0; i < ws_weapons.length; i++) {
			let wsEntry = ws_weapons[i];
			if (wsEntry.ID == "")
				continue;
			let id = Number(wsEntry.ID);
			let myEntry = weaponMap.get(id);
			if (myEntry) {
				myEntry.ws = wsEntry;
			} else {
				console.error(`unknown cardMstId in weaponssearch: ${wsEntry.ID}`);
				weaponMap.set(wsEntry.ID, { mst: null, ws: wsEntry });
			}
		}
	}

	{
		let skill_mst_list_jp = lists.skill_mst_list_jp;
		let skill_mst_list_en = lists.skill_mst_list_en;
		let skill_multipliers_blue = lists.skill_multipliers_blue;
		for (let i = 0; i < skill_mst_list_jp.length; i++) {
			let entry = skill_mst_list_jp[i];
			let myEntry = skillMap.get(entry.skillMstId);
			if (myEntry) {
				myEntry.jp = entry;
			}
		}
		for (let i = 0; i < skill_mst_list_en.length; i++) {
			let entry = skill_mst_list_en[i];
			let myEntry = skillMap.get(entry.skillMstId);
			if (myEntry) {
				myEntry.en = entry;
			}
		}
		for (const e of weaponMap.values()) {
			if (!e.ws || !e.ws.rate_text || !e.mst)
				continue;
			let myEntry = skillMap.get(e.mst.frontSkillMstId);
			if (myEntry.ws && myEntry.ws != e.ws.rate_text) {
				console.error(`Duplicate rate_text for skill ${e.mst.frontSkillMstId}: '${myEntry.ws}' vs. '${e.ws.rate_text}'`);
			}
			myEntry.ws = e.ws.rate_text;
		}
		for (let i = 0; i < skill_multipliers_blue.length; i++) {
			let e = skill_multipliers_blue[i];
			let skill = skillMap.get(e.skillMstId);
			if (skill) {
				skill.blue = e;
			}
		}
	}

	let skillList = [];
	for (const e of skillMap.values()) {
		skillList.push(e);
	}
	skillList.sort(function(a, b) {
		if (a.en && b.en) {
			if (a.en.name != b.en.name) {
				return a.en.name.localeCompare(b.en.name);
			}
			return a.en.cardMstId - b.en.cardMstId;
		} else if (a.en && !b.en) {
			return -1;
		} else {
			return 1;
		}
	});

	let html = '';
	html += '<h1>Skill map</h1>';
	html += '<table class="table table-bordered table-sm">';

	html += '<thead class="table-light sticky-top">';
	html += '<tr>';
	html += '<th>skillMstId</th>';
	html += '<th>name</th>';
	html += '<th>description</th>';
	html += '<th>ws rates</th>';
	html += '<th>blue rates</th>'
	html += '</tr>';
	html += '</thead>';

	html += '<tbody>';
	for (let i = 0; i < skillList.length; i++) {
		let e = skillList[i];
		let id       = e.en ? e.en.skillMstId : e.jp.skillMstId;
		let en_name  = e.en ? e.en.name : "";
		let en_desc  = e.en ? e.en.description.replace("\\n", "<br>") : "";
		let jp_name  = e.jp ? e.jp.name : "";
		let jp_desc  = e.jp ? e.jp.description.replace("\\n", "<br>") : "";
		let ws_rates = e.ws ? e.ws : "";

		let blue_rates = '';
		if (e.blue) {
			let b = e.blue;
			let text = getMultiplierText(b, 'damage');
			if (text) blue_rates += `damage: ${text},`;
			text = getMultiplierText(b, 'recovery');
			if (text) blue_rates += `recovery: ${text},`;
			text = getMultiplierText(b, 'patk');
			if (text) blue_rates += `patk: ${text},`;
			text = getMultiplierText(b, 'matk');
			if (text) blue_rates += `matk: ${text},`;
			text = getMultiplierText(b, 'pdef');
			if (text) blue_rates += `pdef: ${text},`;
			text = getMultiplierText(b, 'mdef');
			if (text) blue_rates += `mdef: ${text},`;
		}

		html += `<tr>`;
		html += `<td rowspan=2>${id}</td>`;
		html += `<td>${en_name}</td>`
		html += `<td>${en_desc}</td>`
		html += `<td rowspan=2>${ws_rates}</td>`;
		html += `<td rowspan=2>${blue_rates}</td>`;
		html += `</tr>`;

		html += `<tr>`;
		html += `<td>${jp_name}</td>`;
		html += `<td>${jp_desc}</td>`;
		html += `<tr>`;
	}
	html += '</tbody>';

	html += '</table>';

	let content = document.getElementById("content");
	content.innerHTML = html;

	return "Datamine viewer - skill map"
}

function viewLibrary(cardsByName_promise, skillsById_promise) {
	function calcGridIndependentInfo(item, skillsById) {
		item.variantMax = item.card.variants[item.card.variants.length - 1];
		item.coloMainSkill = skillsById[item.variant.frontSkillMstId];
		item.coloMainSkillMax = skillsById[item.variantMax.frontSkillMstId];
		item.coloAidSkill = skillsById[item.variant.autoSkillMstId];
		item.coloAidSkillMax = skillsById[item.variantMax.autoSkillMstId];

		const maxLevelBase = RARITY_LEVELS[item.rarity];
		const maxLevelLB = RARITY_LB_LEVELS[item.rarity];
		let maxLevel = maxLevelBase + item.limitBreaks*maxLevelLB;
		if (maxLevel > item.variant.maxLevel) {
			maxLevel = item.variant.maxLevel;
		}
		item.isMaxLevel = item.level == maxLevel;

		const maxSLevel = 15 + item.limitBreaks + Math.floor(item.limitBreaks / 4);
		item.isMaxColoMainSLevel = item.coloMainSLevel == maxSLevel;
		item.isMaxColoAidSLevel = item.coloAidSLevel == maxSLevel;

	}

	async function readAsText(reader, file) {
		return new Promise(function(resolve, reject) {
			reader.onloadend = function() {
				resolve(reader.result);
			};
			reader.readAsText(file);
		});
	}

	async function onLibraryImportChanged(event) {
		const [file] = event.target.files;
		if (!file)
			return;

		const reader = new FileReader();
		const [libraryText_res, cardsByName_res, skillsById_res] = await Promise.allSettled([
			readAsText(reader, file),
			cardsByName_promise,
			skillsById_promise,
		]);
		const libraryText = libraryText_res.value;
		const cardsByName = cardsByName_res.value;
		const skillsById = skillsById_res.value;

		const libraryItems = libraryTable.tableModel.data;
		libraryItems.length = 0;
		const libraryLines = libraryText.split('\n');
		for (const line of libraryLines) {
			const lineCells = line.split('\t');
			if (lineCells.length != 7)
				continue;

			const item = {
				name: lineCells[0].trim(),
				rarity: rarityToIdx[lineCells[1].trim()],
				evoLevel: lineCells[2].trim(),
				limitBreaks: lineCells[3].trim()|0,
				level: lineCells[4].trim()|0,
				coloMainSLevel: lineCells[5].trim()|0,
				coloAidSLevel: lineCells[6].trim()|0,

				card: null,
				variant: null,
			};
			if (item.evoLevel)
				item.evoLevel = item.evoLevel|0;

			item.card = cardsByName[item.name];
			if (item.card) {
				for (const variant of item.card.variants) {
					let isMatch = variant.rarity == item.rarity;
					if (isMatch) {
						isMatch = variant.name == item.name;
					}
					if (isMatch) {
						if (!variant.isInfiniteEvolution && (item.evoLevel === ""))
							isMatch = true;
						else if (variant.isInfiniteEvolution && variant.evolutionLevel == item.evoLevel)
							isMatch = true;
						else
							isMatch = false;
					}
					if (isMatch) {
						item.variant = variant;
						break;
					}
				}
			}

			calcGridIndependentInfo(item, skillsById);
			libraryItems.push(item);
		}

		libraryTable.refreshBody();
	}

	let html = '<h1>Library</h1>';
	html += '<input id="library-import" type="file" />';

	let content = document.getElementById("content");
	content.innerHTML = html;

	const libraryImport = document.getElementById("library-import");
	libraryImport.addEventListener('change', onLibraryImportChanged);

	const table = {
		class: "table table-bordered table-hover table-sm text-nowrap",
		theadClass: "table-light sticky-top",
		columns: [
			{
				title: "Name",
				field: "name",
				cmp: (l,r,col) => collator.compare(l.data.name, r.data.name),
			},
			{
				title: "Rarity",
				dataGenerator: (row) => rarityMap[row.rarity],
				cmp: (l,r,col) => collator.compare(l.data.rarity, r.data.rarity),
				classGenerator: (row) => (row.rarity == row.variantMax.rarity) ? "maxed-val" : null,
			},
			{
				title: "Rarity (max)",
				dataGenerator: (row) => rarityMap[row.variantMax.rarity],
				cmp: (l,r,col) => collator.compare(l.data.variantMax.rarity, r.data.variantMax.rarity),
			},
			{
				title: "Evo",
				field: "evoLevel",
				cmp: (l,r,col) => {
					const lEvo = l.data.evoLevel|0;
					const rEvo = r.data.evoLevel|0;
					return lEvo - rEvo;
				},
			},
			{
				title: "LBs",
				field: "limitBreaks",
				cmp: (l,r,col) => l.data.limitBreaks - r.data.limitBreaks,
			},
			{
				title: "Level",
				field: "level",
				cmp: (l,r,col) => l.data.level - r.data.level,
				classGenerator: (item) => item.isMaxLevel ? "maxed-val" : null,
			},
			{
				title: "Skill level",
				field: "coloMainSLevel",
				cmp: (l,r,col) => l.data.coloMainSLevel - r.data.coloMainSLevel,
				classGenerator: (item) => item.isMaxColoMainSLevel ? "maxed-val" : null,
			},
			{
				title: "Support skill level",
				field: "coloAidSLevel",
				cmp: (l,r,col) => l.data.coloAidSLevel - r.data.coloAidSLevel,
				classGenerator: (item) => item.isMaxColoAidSLevel ? "maxed-val" : null,
			},
			{
				title: "Type",
				dataGenerator: (row) => cardDetailTypeWeapon_strings[row.variant.cardDetailType - 1],
				cmp: (l,r,col) => l.data.variant.cardDetailType - r.data.variant.cardDetailType,
			},
			{
				title: "Element",
				dataGenerator: (row) => attribute_strings[row.variant.attribute - 1],
				cmp: (l,r,col) => l.data.variant.attribute - r.data.variant.attribute,
			},
			{
				title: "Skill",
				dataGenerator: (row) => row.coloMainSkill.name,
				cmp: (l,r,col) => collator.compare(l.data.coloMainSkill.name, r.data.coloMainSkill.name),
			},
			{
				title: "Skill (max)",
				dataGenerator: (row) => row.coloMainSkillMax.name,
				cmp: (l,r,col) => collator.compare(l.data.coloMainSkillMax.name, r.data.coloMainSkillMax.name),
			},
			{
				title: "Support skill",
				dataGenerator: (row) => row.coloAidSkill.name,
				cmp: (l,r,col) => collator.compare(l.data.coloAidSkill.name, r.data.coloAidSkill.name),
			},
			{
				title: "Support skill (max)",
				dataGenerator: (row) => row.coloAidSkillMax.name,
				cmp: (l,r,col) => collator.compare(l.data.coloAidSkillMax.name, r.data.coloAidSkillMax.name),
			},
		],
		data: [],
	};

	const libraryTable = new Table(table, 'column-filter-dialog', {});
	content.appendChild(libraryTable.domTable);

	return "Datamine viewer - library";
}

function viewGcStats(db) {
	let gc_stats = db.json.gc_stats;

	let generateTable = function(table) {
		let html = `<h2>${table.title}</h2>`;

		let thead = table.thead;
		let tbody = table.tbody;

		html += '<table><thead><tr>';
		for (let i = 0; i < thead.length; i++) {
			html += `<th>${thead[i]}</th>`;
		}
		html += '</tr></thead><tbody>';

		for (let r = 0; r < tbody.length; r++) {
			let row = tbody[r];
			html += '<tr>';
			for (let i = 0; i < row.length; i++) {
				html += `<td>${row[i]}</td>`
			}
			html += '</tr>';
		}

		html += `</tbody></table>`;
		return html;
	}

	let html = '<h1>GC stats</h1>';
	html += generateTable(gc_stats.guild_counts);
	html += generateTable(gc_stats.birth_death_17_18);
	html += generateTable(gc_stats.birth_death_16_17);
	html += generateTable(gc_stats.birth_death_15_16);
	html += generateTable(gc_stats.birth_death_14_15);
	html += generateTable(gc_stats.birth_death_13_14);
	html += generateTable(gc_stats.birth_death_12_13);
	html += generateTable(gc_stats.birth_death_11_12);

	let content = document.getElementById("content");
	content.innerHTML = html;

	return "Datamine viewer - GC stats";
}

function sanitizeVersion(version) {
	if (!version)
		return "EN";

	version = version.toUpperCase();
	if (version != "EN" && version != "JP")
		return "EN";

	return version;
}

function datamineJsonUrl(path) {
	return `https://raw.githubusercontent.com/sinoalice-datamine/data/master/${path}.json`;
}

async function showView(params) {
	let isDebug = params.has("debug");
	let version = sanitizeVersion(params.get("version"));
	let cardMstListName = "card_mst_list";
	if (version != "JP")
		cardMstListName += `_${version.toLowerCase()}`;

	let view = params.get("view");
	if (!view)
		view = '';

	let pageTitle;
	switch(view.toLowerCase())
	{
		case "classes":
		{
			const [characterMst, characterAbilityMst] = await Promise.allSettled([
				loadJson(db.json, datamineJsonUrl(`${version}/character_mst_list`)),
				loadJson(db.json, datamineJsonUrl(`${version}/character_ability_mst_list`)),
			]);
			pageTitle = viewClasses(db, characterMst.value, characterAbilityMst.value, isDebug);
		}
		break;

		case "weapons":
		{
			const cardMstList_promise = loadJson(db.json, datamineJsonUrl(`${version}/${cardMstListName}`));
			const cardsByUniqueId_promise = indexCardsByUniqueId(db.index[version], cardMstList_promise);

			const skillMstList_promise = loadJson(db.json, datamineJsonUrl(`${version}/skill_mst_list`));
			const skillMultipliersBlue_promise = loadJson(db.json, "https://script.google.com/macros/s/AKfycbz9EJA6OVAidLavVaP1GhDaTYaj-4hPE0K7YCbwaZZBrcG6SVKabKqTAsEkSrArTI8/exec");
			const skillsById_promise = indexSkillsById(
				db.index[version], version, skillMstList_promise, skillMultipliersBlue_promise
			);

			// JP skill multipliers (origin of values in Blue's sheets):
			//   https://script.google.com/macros/s/AKfycbzz_h3lGLUPMsSSfwvPZYQrj7r0cR2j0rdQ0YI7lC0prXc5Yrnj2ag9rrm_iPG-ZYfu/exec?callback=jsondata&_=1637531292144
			// TODO: Use these as source if possible. Requires checking whether skillMstId matches between
			// EN and JP or creating translation table of skill names (which kinda defeats the purpose).
			const [cardsByUniqueId, skillsById] = await Promise.allSettled([
				cardsByUniqueId_promise, skillsById_promise
			])
			pageTitle = viewWeapons(version, db, cardsByUniqueId.value, skillsById.value, isDebug);
		}
		break;

		case "skills":
		{
			const [skillMstEn, skillMstJp] = await Promise.allSettled([
				loadJson(db.json, datamineJsonUrl("EN/skill_mst_list")),
				loadJson(db.json, datamineJsonUrl("JP/skill_mst_list")),
			]);
			pageTitle = viewSkills(skillMstEn.value, skillMstJp.value, isDebug);
		}
		break;

		case "weaponmap":
		{
			const results = await Promise.allSettled([
				loadJson(db.json, datamineJsonUrl("EN/skill_mst_list")),
				loadJson(db.json, datamineJsonUrl("JP/skill_mst_list")),
				loadJson(db.json, datamineJsonUrl("EN/card_mst_list_en")),
				loadJson(db.json, datamineJsonUrl("JP/card_mst_list")),
				loadJson(db.json, "https://script.google.com/macros/s/AKfycbz9EJA6OVAidLavVaP1GhDaTYaj-4hPE0K7YCbwaZZBrcG6SVKabKqTAsEkSrArTI8/exec"),
				loadJsonp(db.json, "https://script.google.com/macros/s/AKfycby0_uQ6iu9tuWckhDA5Me_rbEMl_ukAbphjw1lYIXH73qBV7c6tg35926Z3SXhCXj0zZA/exec"),
			]);
			const lists = {
				skill_mst_list_en: results[0].value,
				skill_mst_list_jp: results[1].value,
				card_mst_list_en: results[2].value,
				card_mst_list_jp: results[3].value,
				skill_multipliers_blue: results[4].value,
				weaponssearch_weapons: results[5].value,
			};
			pageTitle = viewWeaponmap(lists, isDebug);
		}
		break;

		case "nightmares":
		{
			const [cardMst, artMst] = await Promise.allSettled([
				loadJson(db.json, datamineJsonUrl(`${version}/${cardMstListName}`)),
				loadJson(db.json, datamineJsonUrl(`${version}/art_mst_list`)),
			]);
			pageTitle = viewNightmares(cardMst.value, artMst.value, isDebug);
		}
		break;

		case "library":
		{
			const cardMstList_promise = loadJson(db.json, datamineJsonUrl(`${version}/${cardMstListName}`));
			const cardsByUniqueId_promise = indexCardsByUniqueId(db.index[version], cardMstList_promise);
			const cardsByName_promise = indexCardsByName(db.index[version], cardsByUniqueId_promise);
			const skillMstList_promise = loadJson(db.json, datamineJsonUrl(`${version}/skill_mst_list`));
			const skillMultipliersBlue_promise = loadJson(db.json, "https://script.google.com/macros/s/AKfycbz9EJA6OVAidLavVaP1GhDaTYaj-4hPE0K7YCbwaZZBrcG6SVKabKqTAsEkSrArTI8/exec");
			const skillsById_promise = indexSkillsById(
				db.index[version], version, skillMstList_promise, skillMultipliersBlue_promise
			);

			pageTitle = viewLibrary(cardsByName_promise, skillsById_promise);
		}
		break;

		default:
		{
			const content = document.getElementById("content");
			content.innerHTML = "";
			pageTitle = "Datamine viewer";
		}
		break;
	}

	return pageTitle;
}

setupViewRequestHandler(showView, {
	primary: {
		key: "view",
		values: [
			{ value: "classes", displayText: "Units (character/class)" },
			{ value: "weapons", displayText: "Weapons" },
			{ value: "skills", displayText: "Skills" },
			{ value: "weaponmap", displayText: "Weapon map" },
			{ value: "nightmares", displayText: "Nightmares" },
			{ value: "library", displayText: "Library" },
		]
	},
	secondary: {
		key: "version",
		default: "en",
		values: [
			{ value: "en", displayText: "EN" },
			{ value: "jp", displayText: "JP" },
		]
	}
});
