#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { select, confirm, input } from "@inquirer/prompts";
import pkg from "terminal-kit";
import chalk from "chalk";
import { new_exer } from "./new-exer.js";
const term = pkg.terminal;

async function whichExer(excercises) {
	const choiceInd = await select({
		message: "Which one?",
		choices: excercises.map((line, ind) => {
			return { name: line.name, value: ind };
		}),
		loop: false,
	});
	return excercises[choiceInd];
}

async function editExer(excercises, database, exerChoice = false) {
	if (!exerChoice) exerChoice = await whichExer(excercises);

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

	const editSql = database.prepare(
		`UPDATE exercises SET ${updateRow} = ? WHERE id = ?`
	);
	editSql.run(updatedInfo, exerChoice.id);
	console.log(chalk.blue("Updated!"));

	if (
		await confirm({
			message: "Change something else about this excercise?",
		})
	) {
		await editExer(excercises, database, exerChoice);
	}
}

async function deleteExer(excercises, database) {
	const exerChoice = await whichExer(excercises);

	const delSql = database.prepare(`DELETE FROM exercises WHERE id = ?`);

	if (
		await confirm({
			message: `You sure you want to delete ${exerChoice.name}?`,
		})
	) {
		delSql.run(exerChoice.id);
		console.log(chalk.red("Deleted!"));
	}
}

export async function viewExer(userId) {
	const database = new DatabaseSync("./database.db");
	let excercisesSql = database.prepare(
		`SELECT * FROM exercises WHERE user_id = ? ORDER BY LOWER(name)`
	);
	let excercises = excercisesSql.all(userId);

	if (excercises.length < 1) {
		if (
			await confirm({
				message: "You don't have any exercises. Would you like to add one?",
			})
		) {
			await new_exer(userId);
		}
		return;
	}

	const tableHeader = ["#", "Name", "Description", "BPM", "Key", "Play Count"];
	let tableRows = excercises.map((line, ind) => [
		ind + 1,
		line.name,
		line.description,
		line.bpm,
		line.key,
		line.count,
	]);

	term.table([tableHeader, ...tableRows], {
		fit: false,
		firstRowTextAttr: { bold: true },
	});

	for (let editOrDel = 0; editOrDel < 4; ) {
		let message = editOrDel === 0 ? "an" : "another";

		editOrDel = await select({
			message: `Would you like to add, delete, or edit ${message} exercise?`,
			choices: [
				{ name: "Add", value: 1 },
				{ name: "Edit", value: 2 },
				{ name: "Delete", value: 3 },
				{ name: "Nope. Return to menu", value: 4 },
			],
		});

		switch (editOrDel) {
			case 1:
				await new_exer(userId);
				break;
			case 2:
				await editExer(excercises, database);
				break;
			case 3:
				await deleteExer(excercises, database);
		}

		excercises = excercisesSql.all(userId);
	}

	database.close();
}
