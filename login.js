#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { input, password, select } from "@inquirer/prompts";

const database = new DatabaseSync("./test.db");

export async function login() {
	let username = await input({ message: "username:" });

	let selection = database.prepare(`SELECT * FROM users where username = ?`);
	let tryout = selection.get(username);

	while (!tryout) {
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
		tryout = selection.get(username);
	}

	let pw = await password({ message: "password:", mask: true });
	while (pw !== tryout.password) {
		pw = await password({
			message: "Wrong password. Try again:",
			mask: true,
		});
	}

	database.close();
	return tryout.id;
}
