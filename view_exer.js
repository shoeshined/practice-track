#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { select, confirm } from "@inquirer/prompts";
import pkg from "terminal-kit";
import chalk from "chalk";
const term = pkg.terminal;

export async function view_exer(id) {
	const database = new DatabaseSync("./test.db");
	let selection = database.prepare(
		`SELECT * FROM exercises WHERE user_id = ? ORDER BY LOWER(name)`
	);
	let excercises = selection.all(id);

	const header = ["", "Name", "Description", "BPM", "Key", "Play Count"];
	let tableRows = [];

	excercises.forEach((line, ind) =>
		tableRows.push([
			ind + 1,
			line.name,
			line.description,
			line.bpm,
			line.key,
			line.count,
		])
	);

	term.table([header, ...tableRows], { fit: false });

	let editOrDel = await select({
		message: "Would you like to delete or edit an exercise?",
		choices: [
			{ name: "Edit", value: 1 },
			{ name: "Delete", value: 2 },
			{ name: "Return to menu", value: 0 },
		],
	});

	if (editOrDel === 0) {
		database.close();
		return;
	}

	let names = excercises.map((line, ind) => {
		return { name: line.name, value: ind };
	});
	let exer = await select({
		message: "Which one?",
		choices: names,
		loop: false,
	});
	const choise = excercises[exer];

	if (editOrDel === 1) {
		editExer(choise.id, database);
	} else {
		if (
			await confirm({
				message: `You sure you want to delete ${choise.name}?`,
			})
		) {
			deleteExer(choise.id, database);
		}
	}

	database.close();
}

function editExer(id, database) {
	//todo
	console.log("(haven't coded this part yet... sorry)");
}

function deleteExer(id, database) {
	const sql = database.prepare(`DELETE FROM exercises WHERE id = ?`);
	sql.run(id);
	console.log(chalk.red("Deleted!"));
}
