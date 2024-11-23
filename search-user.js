#!/usr/bin/env node

import chalk from "chalk";
import { input, confirm, select } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";
import pkg from "terminal-kit";
const term = pkg.terminal;

export async function searchUser() {
	const database = new DatabaseSync("./database.db");

	let existsSql = database.prepare(
			`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
		),
		isEmptySql = database.prepare(`SELECT count(*) FROM users`);

	const anyUsers = (await existsSql.get())
		? await isEmptySql.get()["count(*)"]
		: 0;
	if (!anyUsers) {
		console.log(chalk.red("There's no users listed at all! Sorry!"));
		return;
	}

	const searchCat = await select({
		message: "Search by what?",
		choices: [
			{ name: "Username", value: "username" },
			{ name: "First name", value: "first_name" },
			{ name: "Last Name", value: "last_name" },
			{ name: "Email", value: "email" },
		],
	});

	let searchValue = await input({ message: "search:" });

	let selection = database.prepare(
		`SELECT id, first_name, last_name, username, email FROM users where ${searchCat} = ?`
	);
	let results = selection.all(searchValue);

	while (!results) {
		const tryAgain = await confirm({ message: "No results. Try again?" });
		if (tryAgain) {
			searchValue = await input({ message: "search:" });
			results = selection.all(searchValue);
		} else {
			console.log("Have a good day!");
			break;
		}
	}
	if (results) {
		const tableHeader = ["username", "First name", "Last name", "email"];

		let tableRows = results.map(x => [
			x.username,
			x.first_name,
			x.last_name,
			x.email,
		]);
		term.table([tableHeader, ...tableRows], {
			fit: false,
			firstRowTextAttr: { bold: true },
		});
	}

	database.close();
}
