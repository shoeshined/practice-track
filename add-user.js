#!/usr/bin/env node

import chalk from "chalk";
import { input, password } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";
const database = new DatabaseSync("./test.db");

export async function addUser() {
	let create = `CREATE TABLE if not exists users(
		id INTEGER PRIMARY KEY,
		first_name STRING,
		last_name STRING,
		username STRING UNIQUE NOT NULL,
		password NOT NULL,
		email NOT NULL)`;
	database.exec(create);

	const first_name = await input({ message: "What's your first name?" }),
		last_name = await input({ message: "What's your last name?" }),
		username = await input({ message: "username?" }),
		pw = await password({ message: "password?", mask: true }),
		confirm = await password({ message: "confirm password", mask: true });

	while (confirm !== pw) {
		confirm = await input({ message: "that didn't match, try again" });
	}

	const email = await input({
		message: chalk.green("Ok, last one. What's your email?"),
	});

	const userInsert = database.prepare(
		`INSERT INTO users(first_name,last_name,username,password,email) VALUES (?,?,?,?,?)`
	);
	userInsert.run(first_name, last_name, username, pw, email);
	database.close();

	console.log(chalk.blue(`\r\nUser ${username} created! Welcome!\r\n`));
}
