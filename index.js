#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { addUser } from "./add-user.js";
import { deleteUser } from "./delete-user.js";
import { searchUser } from "./search-user.js";
import { login } from "./login.js";
import { new_exer } from "./new_exer.js";
import { view_exer } from "./view_exer.js";
import { new_routine } from "./new_routine.js";
import { run_routine } from "./run-routine.js";

const database = new DatabaseSync("./database.db");

const table1 = async () => {
	const choice = await select({
		message: "What do you want to do?",
		choices: [
			{ name: "Login", value: "login" },
			{ name: "Add user", value: "add" },
			{ name: "Delete user", value: "delete" },
			{ name: "Search for user", value: "search" },
		],
	});
	return choice;
};

const table1Switch = async choice => {
	switch (choice) {
		case "login":
			userId = await login();
			if (userId === "add") {
				table1Switch("add");
			}
			break;
		case "add":
			await addUser();
			break;
		case "delete":
			await deleteUser();
			break;
		case "search":
			await searchUser();
			break;
		case "view":
			let sql = database.prepare(`SELECT * FROM users ORDER BY id`);
			let thing = sql.all();
			console.log(thing);
	}
};

const table2 = async (userId, visitNum = 1) => {
	let selection = database.prepare(`SELECT * FROM users WHERE id = ?`);
	const userInfo = selection.get(userId);
	let greeting =
		visitNum === 1 ? `Hi, ${userInfo.first_name}!` : `Anything else?`;
	let table2 = await select({
		message: greeting,
		choices: [
			{ name: "Run a routine", value: "run_routine" },
			{ name: "Create exercise", value: "new_exer" },
			{ name: "View excercises", value: "view_exer" },
			{ name: "Create a new routine", value: "new_routine" },
			{ name: "View routines", value: "view_routine" },
			{ name: "Logout", value: "logout" },
		],
	});
	await table2Switch(table2, userId);
};

const table2Switch = async (choice, id) => {
	switch (choice) {
		case "run_routine":
			//todo
			await run_routine(id);
			await table2(id, 2);
			break;
		case "new_exer":
			await new_exer(id);
			await table2(id, 2);
			break;
		case "new_routine":
			await new_routine(id);
			await table2(id, 2);
			break;
		case "view_exer":
			await view_exer(id);
			await table2(id, 2);
			break;
		case "view_routine":
			//todo
			console.log("I haven't coded this bit yet...sorry");
			await table2(id, 2);
			break;
		case "logout":
			console.log(chalk.blue("Have a nice day!"));
	}
};

let userId = false;
await table1Switch(await table1());
if (userId) await table2(userId);

database.close();
