#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { select, confirm, input } from "@inquirer/prompts";
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

	for (let editOrDel = 0; true; ) {
		let message = editOrDel === 0 ? "an" : "another";

		editOrDel = await select({
			message: `Would you like to delete or edit ${message} exercise?`,
			choices: [
				{ name: "Edit", value: 1 },
				{ name: "Delete", value: 2 },
				{ name: "Nope. Return to menu", value: 0 },
			],
		});

		if (editOrDel === 0) {
			break;
		}

		if (editOrDel === 1) {
			await editExer(excercises, database);
		} else {
			await deleteExer(excercises, database);
		}
	}

	database.close();
}

async function editExer(excercises, database) {
	let names = excercises.map((line, ind) => {
		return { name: line.name, value: ind };
	});
	let exer = await select({
		message: "Which one?",
		choices: names,
		loop: false,
	});
	const choice = excercises[exer];

	const updateRow = await select({
		message: "What would you like to update?",
		choices: [
			{ name: "Name", value: "name" },
			{ name: "description", value: "description" },
			{ name: "BPM", value: "bpm" },
			{ name: "Key", value: "key" },
		],
	});

	const updatedInfo = await input({
		message: "What would you like to change it to?",
	});

	const sql = database.prepare(
		`UPDATE exercises SET ${updateRow} = ? WHERE id = ?`
	);
	sql.run(updatedInfo, choice.id);
	console.log(chalk.blue("Updated!"));

	if (
		await confirm({
			message: "Change something else about this excercise?",
		})
	) {
		await editExer(excercises, database);
	}
}

async function deleteExer(excercises, database) {
	let names = excercises.map((line, ind) => {
		return { name: line.name, value: ind };
	});

	let exer = await select({
		message: "Which one?",
		choices: names,
		loop: false,
	});
	const choice = excercises[exer];

	const sql = database.prepare(`DELETE FROM exercises WHERE id = ?`);
	if (
		await confirm({
			message: `You sure you want to delete ${choice.name}?`,
		})
	) {
		sql.run(choice.id);
		console.log(chalk.red("Deleted!"));
	}
}
