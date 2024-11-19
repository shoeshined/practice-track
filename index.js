#!/usr/bin/env node

import { rawlist } from "@inquirer/prompts";
import { DatabaseSync } from "node:sqlite";
import { addUser } from "./add-user.js";
import { deleteUser } from "./delete-user.js";

const database = new DatabaseSync("./test.db");

const choice = await rawlist({
	message: "What do you want to do?",
	choices: [
		{ name: "Add user", value: "add" },
		{ name: "Delete user", value: "delete" },
	],
});

if (choice === "add") {
	await addUser();
} else if (choice === "delete") {
	await deleteUser();
}

database.close();

// const query = database.prepare("SELECT * FROM users ORDER BY id");

// console.log(query.all());
