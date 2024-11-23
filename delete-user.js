#!/usr/bin/env node

import chalk from "chalk";
import { input, password, confirm } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";

export async function deleteUser() {
	const database = new DatabaseSync("./database.db");

	let username = await input({ message: "What's the username?" });

	let userSql = database.prepare(`SELECT * FROM users where username = ?`);
	let userInfo = userSql.get(username);

	while (!userInfo) {
		username = await input({ message: "User doesn't exist. Try again:" });
		userInfo = userSql.get(username);
	}

	let password = await password({ message: "password?", mask: true });
	while (password !== userInfo.password) {
		password = await password({
			message: "Wrong password. Try again:",
			mask: true,
		});
	}

	if (
		!(await confirm({
			message: `You sure you want to delete ${username}?`,
		}))
	) {
		database.close();
		return;
	}

	const userDeleteSql = database.prepare(
		`DELETE FROM users WHERE username = ?`
	);
	userDeleteSql.run(username);

	console.log(
		chalk.red("\r\nUser deleted! We hope you enjoyed your time with us.\r\n")
	);

	database.close();
}
