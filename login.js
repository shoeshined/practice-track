#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { input, password, select } from "@inquirer/prompts";

const database = new DatabaseSync("./database.db");

export async function login() {
	let username = await input({ message: "username:" });

	let userInfoSql = database.prepare(`SELECT * FROM users where username = ?`);
	let userInfo = userInfoSql.get(username);

	while (!userInfo) {
		let retry = await select({
			message:
				"Incorrect username. Would you like to create an account instead?",
			choices: [
				{ name: "Reenter username", value: "retry" },
				{ name: "Create new account", value: "add" },
			],
		});

		if (retry === "add") return "add";

		username = await input({ message: "username:" });
		userInfo = userInfoSql.get(username);
	}

	let pw = await password({ message: "password:", mask: true });
	while (pw !== userInfo.password) {
		pw = await password({
			message: "Wrong password. Try again:",
			mask: true,
		});
	}

	database.close();
	return userInfo.id;
}
