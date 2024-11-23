#!/usr/bin/env node

import chalk from "chalk";
import { input, password, confirm } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";

export async function deleteUser() {
	const database = new DatabaseSync("./database.db");

	let username = await input({ message: "What's the username?" });

	let select = database.prepare(`SELECT * FROM users where username = ?`);
	let tryout = select.get(username);

	while (!tryout) {
		username = await input({ message: "User doesn't exist. Try again:" });
		tryout = select.get(username);
	}

	let pw = await password({ message: "password?", mask: true });
	while (pw !== tryout.password) {
		pw = await password({
			message: "Wrong password. Try again:",
			mask: true,
		});
	}

	if (
		await confirm({
			message: `You sure you want to delete ${username}?`,
		})
	) {
		const userDelete = database.prepare(
			`DELETE FROM users WHERE username = ?`
		);
		userDelete.run(username);

		console.log(
			chalk.red(
				"\r\nUser deleted! We hope you enjoyed your time with us.\r\n"
			)
		);
	}

	database.close();
}
