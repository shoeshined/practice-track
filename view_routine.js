#!/usr/bin/env node

import { DatabaseSync } from "node:sqlite";
import { select, confirm, input } from "@inquirer/prompts";
import chalk from "chalk";

async function editRoutine(database, userId, routineId, repeat = false) {
	const updateRow = await select({
		message: repeat ? "Anything else?" : "What would you like to update?",
		choices: [
			{ name: "Name", value: "name" },
			{ name: "Description", value: "description" },
			{ name: "Add an excercise", value: "add" },
			{ name: "Delete an excercise", value: "delete" },
			{ name: "Done, return to menu", value: "done" },
		],
	});

	const thisRoutineSql = database.prepare(
		`SELECT name, r.id, r.position
		FROM routineexers r
			JOIN exercises ON r.exer_id = exercises.id
		WHERE routine_id = ?
		ORDER BY position`
	);

	switch (updateRow) {
		case "name":
			let nameUpdate = await input({
				message: "What would you like to change it to?",
			});
			const nameSql = database.prepare(
				`UPDATE routines SET name = ? WHERE id = ?`
			);
			await nameSql.run(nameUpdate, routineId);
			break;
		case "description":
			let descUpdate = await input({
				message: "What would you like to change it to?",
			});
			const descSql = database.prepare(
				`UPDATE routines SET description = ? WHERE id = ?`
			);
			await descSql.run(descUpdate, routineId);
			break;
		case "add":
			const { addToRoutine } = await import("./new_routine.js");
			let start = thisRoutineSql.all(routineId).length;
			await addToRoutine(userId, routineId, "Add exercise:", start);
			break;
		case "delete":
			for (let i = false; ; i = true) {
				let message = i ? "Delete another?" : "Which one?";
				let choices = thisRoutineSql.all(routineId).map(line => ({
					name: line.name,
					value: line,
				}));
				if (i) {
					choices.unshift({ name: "Nope. Done deleting", value: "done" });
				}

				let delChoice = await select({
					message: message,
					choices: choices,
				});
				if (delChoice === "done") break;

				let delConfirm = await confirm({
					message: `You sure you want to delete ${delChoice.name}?`,
				});
				if (delConfirm) {
					let delSql = database.prepare(
						`DELETE FROM routineexers WHERE id = ?`
					);
					await delSql.run(delChoice.id);
					let moveSql = database.prepare(
						`UPDATE routineexers SET position = position - 1 WHERE position > ? `
					);
					await moveSql.run(delChoice.position);
					console.log(chalk.red("deleted!"));
				}
			}
			break;
		case "done":
			return;
	}

	await editRoutine(database, userId, routineId, true);
}

async function deleteRoutine(database, routineChoice) {
	const delSql = database.prepare(`DELETE FROM routines WHERE id = ?`);

	if (
		await confirm({
			message: `You sure you want to delete ${routineChoice.name}?`,
		})
	) {
		await delSql.run(routineChoice.id);
		console.log(chalk.red("Deleted!"));
	}
}

export async function viewRoutine(userId) {
	const database = new DatabaseSync("./database.db");
	let routinesSql = database.prepare(
		`SELECT * FROM routines WHERE user_id = ? ORDER BY LOWER(name)`
	);
	let routines = routinesSql.all(userId);

	if (routines.length < 1) {
		if (
			await confirm({
				message: "You don't have any routines. Would you like to add one?",
			})
		) {
			const { new_routine } = await import("./new_routine.js");
			await new_routine(userId);
		}
		return;
	}

	for (let editOrDel = 0; editOrDel < 3; ) {
		let listChoices = [
			{ name: "Return to main menu", value: false },
			...routines.map(routine => ({
				name: routine.name,
				value: routine,
			})),
		];

		let routineChoice = await select({
			message: "Select to view details:",
			choices: listChoices,
		});

		if (!routineChoice) break;

		const thisRoutineSql = database.prepare(
			`SELECT name
            FROM routineexers
                JOIN exercises ON routineexers.exer_id = exercises.id
            WHERE routine_id = ?
            ORDER BY position`
		);

		let exersList = thisRoutineSql.all(routineChoice.id),
			exersString = exersList
				.map((line, ind) => `${ind + 1}) ${line.name}`)
				.join("\n");

		console.log(
			"\n" +
				chalk.blue.bold.underline(`${routineChoice.name}\n`) +
				chalk.yellowBright(
					routineChoice.description
						? `~${routineChoice.description}~\n\n`
						: `\n`
				) +
				chalk.green(`${exersString}\n`)
		);

		editOrDel = await select({
			message: `Would you like to edit or delecte ${routineChoice.name}?`,
			choices: [
				{ name: `Edit ${routineChoice.name}`, value: 1 },
				{ name: `Delete ${routineChoice.name}`, value: 2 },
				{ name: "Nope. Return to menu", value: 3 },
			],
		});

		switch (editOrDel) {
			case 1:
				await editRoutine(database, userId, routineChoice.id);
				break;
			case 2:
				await deleteRoutine(database, routineChoice);
		}

		routines = routinesSql.all(userId);
	}

	database.close();
}
