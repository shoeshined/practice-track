#!/usr/bin/env node

import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";
const database = new DatabaseSync("./test.db");

export async function deleteUser() {
	let username = await input({ message: "What's the username?" });

	let select = database.prepare(`SELECT * FROM users where username = ?`);
	let tryout = select.get(username);

	while (!tryout) {
		username = await input({ message: "User doesn't exist. Try again:" });
		tryout = select.get(username);
	}

	let password = await input({ message: "password?" });
	while (password !== tryout.password) {
		password = await input({ message: "Wrong password. Try again:" });
	}

	const userDelete = database.prepare(`DELETE FROM users WHERE username = ?`);
	const done = userDelete.run(username);
	database.close();

	console.log(
		chalk.red("\r\nUser deleted! We hope you enjoyed your time with us.\r\n")
	);
}
