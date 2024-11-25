#!/usr/bin/env node

import chalk from "chalk";
import { input, password } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";
const database = new DatabaseSync("./database.db");

export async function addUser() {
	let createUsersSql = `CREATE TABLE if not exists users(
		id INTEGER PRIMARY KEY,
		first_name TEXT NOT NULL,
		last_name TEXT,
		username TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		email TEXT NOT NULL)`;
	database.exec(createUsersSql);
	const usernamesSql = database.prepare(`SELECT username FROM users`);

	const first_name = await input({ message: "What's your first name?" }),
		last_name = await input({ message: "What's your last name?" });
	let username = await input({ message: "username?" });

	while (usernamesSql.all().some(x => x.username === username)) {
		username = await input({ message: "username taken, try again" });
	}

	const pw = await password({ message: "password?", mask: true });
	let confirmPw = await password({ message: "confirm password", mask: true });

	while (confirmPw !== pw) {
		confirmPw = await input({
			message: "that didn't match, try again",
			mask: true,
		});
	}

	const email = await input({
		message: chalk.green("Ok, last one. What's your email?"),
	});

	const userInsertSql = database.prepare(
		`INSERT INTO users(first_name,last_name,username,password,email) VALUES (?,?,?,?,?)`
	);
	userInsertSql.run(first_name, last_name, username, pw, email);

	console.log(chalk.blue(`\r\nUser ${username} created! Welcome!\r\n`));
	database.close();
}
