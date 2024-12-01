import { DatabaseSync } from "node:sqlite";
import { select } from "@inquirer/prompts";
import chalk from "chalk";

const database = new DatabaseSync("./database.db");

const menu1 = async () => {
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

const menu1Switch = async choice => {
	switch (choice) {
		case "login":
			const { login } = await import("./login.js");
			return await login();
		case "add":
			const { addUser } = await import("./add-user.js");
			await addUser();
			break;
		case "delete":
			const { deleteUser } = await import("./delete-user.js");
			await deleteUser();
			break;
		case "search":
			const { searchUser } = await import("./search-user.js");
			await searchUser();
			break;
	}
};

const menu2 = async (userId, visitNum = 1) => {
	const userInfoSql = database.prepare(`SELECT * FROM users WHERE id = ?`);
	const userInfo = userInfoSql.get(userId);
	let menu2 = await select({
		message:
			visitNum === 1 ? `Hi, ${userInfo.first_name}!` : `Anything else?`,
		choices: [
			{ name: "Run a routine", value: "runRoutine" },
			{ name: "Create exercise", value: "newExer" },
			{ name: "View excercises", value: "viewExer" },
			{ name: "Create a new routine", value: "newRoutine" },
			{ name: "View routines", value: "viewRoutine" },
			{ name: "View practice history", value: "viewHistory" },
			{ name: "Logout", value: "logout" },
		],
	});
	await menu2Switch(menu2, userId);
};

const menu2Switch = async (choice, userId) => {
	switch (choice) {
		case "runRoutine":
			const { runRoutine } = await import("./run-routine.js");
			await runRoutine(userId);
			await menu2(userId, 2);
			break;
		case "newExer":
			const { newExer } = await import("./new-exer.js");
			await newExer(userId);
			await menu2(userId, 2);
			break;
		case "newRoutine":
			const { newRoutine } = await import("./new-routine.js");
			await newRoutine(userId);
			await menu2(userId, 2);
			break;
		case "viewExer":
			const { viewExer } = await import("./view-exer.js");
			await viewExer(userId);
			await menu2(userId, 2);
			break;
		case "viewRoutine":
			const { viewRoutine } = await import("./view-routine.js");
			await viewRoutine(userId);
			await menu2(userId, 2);
			break;
		case "viewHistory":
			const { viewHistory } = await import("./view-history.js");
			await viewHistory(userId);
			await menu2(userId, 2);
			break;
		case "logout":
			console.log(chalk.blue("Have a nice day!"));
	}
};

let userId = await menu1Switch(await menu1());
if (userId) await menu2(userId);

database.close();
