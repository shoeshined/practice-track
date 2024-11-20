#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { addUser } from "./add-user.js";
import { deleteUser } from "./delete-user.js";
import { searchUser } from "./search-user.js";
import prompt from "inquirer-interactive-list-prompt";
import chalk from "chalk";

const database = new DatabaseSync("./test.db");

const choice = await prompt({
	message: "What do you want to do?",
	choices: [
		{ name: "Add user", value: "add", key: "1" },
		{ name: "Delete user", value: "delete", key: "2" },
		{ name: "Search for user", value: "search", key: "3" },
	],
	renderSelected: choice => chalk.green(`❯ ${choice.key}) ${choice.name}`),
	renderUnselected: choice => `  ${choice.key}) ${choice.name}`,
});

switch (choice) {
	case "add":
		await addUser();
		break;
	case "delete":
		await deleteUser();
		break;
	case "search":
		await searchUser();
}

database.close();
