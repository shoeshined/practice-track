import { DatabaseSync } from "node:sqlite";
import { input, select } from "@inquirer/prompts";
import chalk from "chalk";

export async function new_routine(userId) {
	const database = new DatabaseSync("./database.db");

	//create tables

	let createRoutinesSql = `CREATE TABLE if not exists routines(
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        count INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
	database.exec(createRoutinesSql);
	let createRoutineExersSql = `CREATE TABLE if not exists routineexers(
        id INTEGER PRIMARY KEY,
        routine_id INTEGER,
        exer_id INTEGER,
        position INTEGER,
        FOREIGN KEY(routine_id) REFERENCES routines(id) ON DELETE CASCADE,
        FOREIGN KEY(exer_id) REFERENCES exercises(id) ON DELETE CASCADE   
    )`;
	database.exec(createRoutineExersSql);

	//creat routine

	const routineName = await input({ message: "Routine name:" }),
		routineDescription = await input({ message: "Descrition (optional):" });

	const routinesInsertSql = database.prepare(
		`INSERT INTO routines(user_id, name, description, count) VALUES (?,?,?,?)`
	);
	const routineId = routinesInsertSql.run(
		userId,
		routineName,
		routineDescription,
		0
	).lastInsertRowid;

	//add exercises

	let excercisesSql = database.prepare(
		`SELECT id, user_id, name FROM exercises WHERE user_id = ? ORDER BY LOWER(name)`
	);
	let exercises = excercisesSql.all(userId);
	let exerNames = exercises.map((line, ind) => {
		return { name: line.name, value: ind };
	});

	for (let i = 0, message = "First exercise:"; ; i++) {
		if (i === 1) {
			exerNames.unshift({
				name: "Done adding exercises",
				value: "done",
			});
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

		const routineExersInsertSql = database.prepare(
			`INSERT INTO routineexers(routine_id, exer_id, position) VALUES (?,?,?)`
		);
		routineExersInsertSql.run(routineId, exercises[exer].id, i);
	}

	//print routine

	const getRoutineSql = database.prepare(
		`SELECT name
        FROM routineexers
            JOIN exercises ON routineexers.exer_id = exercises.id
        WHERE routine_id = ?
        ORDER BY position`
	);
	let exersString = getRoutineSql
		.all(routineId)
		.map((line, ind) => `${ind + 1}) ${line.name}`)
		.join("\n");

	console.log(
		chalk.bgGray("\nYour new routine:\n\n") +
			chalk.blue.bold.underline(`${routineName}\n`) +
			chalk.yellowBright(
				routineDescription ? `~${routineDescription}~\n\n` : `\n`
			) +
			chalk.green(`${exersString}\n`)
	);

	database.close;
}
