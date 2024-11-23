#!/usr/bin/env node

import chalk from "chalk";
import { input, confirm, select } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";

export async function searchUser() {
	const database = new DatabaseSync("./database.db");

	let exists = `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`,
		empty = `SELECT count(*) FROM (select 1 from users limit 1)`;

	const does = (await database.prepare(exists).get())
		? await database.prepare(empty).get()["count(*)"]
		: 0;
	if (does === 0) {
		console.log(chalk.red("There's no users listed at all! Sorry!"));
		return;
	}

	const choice = await select({
		message: "Search by what?",
		choices: [
			{ name: "Username", value: "username" },
			{ name: "First name", value: "first_name" },
			{ name: "Last Name", value: "last_name" },
			{ name: "Email", value: "email" },
		],
	});

	let value = await input({ message: "search:" });

	let selection = database.prepare(
		`SELECT id, first_name, last_name, username, email FROM users where ${choice} = ?`
	);
	let results = selection.get(value);

	while (!results) {
		const tryAgain = await confirm({ message: "No results. Try again?" });
		if (tryAgain) {
			value = await input({ message: "search:" });
			results = selection.get(value);
		} else {
			console.log("Have a good day!");
			break;
		}
	}
	if (results) {
		console.log(results);
	}

	database.close();
}
