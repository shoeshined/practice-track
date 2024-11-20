#!/usr/bin/env node

import chalk from "chalk";
import { input, confirm } from "@inquirer/prompts";
import prompt from "inquirer-interactive-list-prompt";
import { DatabaseSync } from "node:sqlite";
const database = new DatabaseSync("./test.db");

export async function searchUser() {
	let exists = `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`,
		empty = `SELECT count(*) FROM (select 1 from users limit 1)`;

	const does = (await database.prepare(exists).get())
		? await database.prepare(empty).get()["count(*)"]
		: 0;
	if (does === 0) {
		console.log(chalk.red("There's no users listed at all! Sorry!"));
		return;
	}

	const choice = await prompt({
		message: "Search by what?",
		choices: [
			{ name: "Username", value: "username", key: "1" },
			{ name: "First name", value: "first_name", key: "2" },
			{ name: "Last Name", value: "last_name", key: "3" },
			{ name: "Email", value: "email", key: "4" },
		],
		renderSelected: choice => chalk.green(`❯ ${choice.key}) ${choice.name}`),
		renderUnselected: choice => `  ${choice.key}) ${choice.name}`,
	});

	let value = await input({ message: "search:" });

	let select = database.prepare(
		`SELECT id, first_name, last_name, username, email FROM users where ${choice} = ?`
	);
	let results = select.get(value);

	while (!results) {
		const tryAgain = await confirm({ message: "No results. Try again?" });
		if (tryAgain) {
			value = await input({ message: "search:" });
			results = select.get(value);
		} else {
			console.log("Have a good day!");
			break;
		}
	}
	if (results) {
		console.log(results);
	}
}
