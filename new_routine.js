import { DatabaseSync } from "node:sqlite";
import { input, select } from "@inquirer/prompts";
import chalk from "chalk";

export async function new_routine(id) {
	const database = new DatabaseSync("./test.db");

	//create tables

	let createRoutines = `CREATE TABLE if not exists routines(
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        count INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
	database.exec(createRoutines);
	let createRoutineExers = `CREATE TABLE if not exists routineexers(
        id INTEGER PRIMARY KEY,
        routine_id INTEGER,
        exer_id INTEGER,
        position INTEGER,
        FOREIGN KEY(routine_id) REFERENCES routines(id) ON DELETE CASCADE,
        FOREIGN KEY(exer_id) REFERENCES exercises(id) ON DELETE CASCADE   
    )`;
	database.exec(createRoutineExers);

	//creat routine

	const name = await input({ message: "Routine name:" }),
		description = await input({ message: "Descrition (optional):" });

	const routinesInsert = database.prepare(
		`INSERT INTO routines(user_id, name, description, count) VALUES (?,?,?,?)`
	);
	const routineId = routinesInsert.run(
		id,
		name,
		description,
		0
	).lastInsertRowid;

	//add exercises

	let selection = database.prepare(
		`SELECT id, user_id, name FROM exercises WHERE user_id = ? ORDER BY LOWER(name)`
	);
	let exercises = selection.all(id);
	let exerNames = exercises.map((line, ind) => {
		return { name: line.name, value: ind };
	});

	for (let i = 0, message = "First exercise:"; ; i++) {
		if (i === 1) {
			exerNames = [
				{ name: "Done adding exercises", value: "done" },
				...exerNames,
			];
			message = "Add another?";
		}
		let exer = await select({
			message: message,
			choices: exerNames,
			loop: false,
		});

		if (exer === "done") {
			break;
		}

		const routineExersInsert = database.prepare(
			`INSERT INTO routineexers(routine_id, exer_id, position) VALUES (?,?,?)`
		);
		routineExersInsert.run(routineId, exercises[exer].id, i);
	}
	const getRoutine = database.prepare(
		`SELECT name
        FROM routineexers
            JOIN exercises ON routineexers.exer_id = exercises.id
        WHERE routine_id = ?
        ORDER BY position`
	);
	let showRoutine = "";
	getRoutine
		.all(routineId)
		.forEach(
			(line, ind) => (showRoutine += "\n" + `${ind + 1}) ` + line.name)
		);

	console.log(
		chalk.bgCyan("Your new routine:/n") +
			chalk.blue(`${name}
`) +
			chalk.green(showRoutine)
	);

	database.close;
}
