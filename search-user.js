#!/usr/bin/env node

import chalk from "chalk";
import { rawlist, input, confirm } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";
const database = new DatabaseSync("./test.db");

export async function searchUser() {
	let exists = database.prepare(
		`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
	);
	const does = exists.get();
	if (!does) {
		console.log(chalk.red("There's no users listed at all! Sorry!"));
		return;
	}
	const choice = await rawlist({
		message: "Search by what?",
		choices: [
			{ name: "Username", value: "username" },
			{ name: "First name", value: "first_name" },
			{ name: "Last Name", value: "last_name" },
			{ name: "Email", value: "email" },
		],
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
