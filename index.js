#!/usr/bin/env node

import { rawlist, search } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";
import { addUser } from "./add-user.js";
import { deleteUser } from "./delete-user.js";
import { searchUser } from "./search-user.js";

const database = new DatabaseSync("./test.db");

const choice = await rawlist({
	message: "What do you want to do?",
	choices: [
		{ name: "Add user", value: "add" },
		{ name: "Delete user", value: "delete" },
		{ name: "Search for user", value: "search" },
	],
});

if (choice === "add") {
	await addUser();
} else if (choice === "delete") {
	await deleteUser();
} else if (choice === "search") {
	await searchUser();
}

database.close();
