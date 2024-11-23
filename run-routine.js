import { DatabaseSync } from "node:sqlite";
import { input, select, checkbox } from "@inquirer/prompts";
import chalk from "chalk";

export async function run_routine(id) {
	const database = new DatabaseSync("./database.db");

	const allRoutinesSql = database.prepare(
		`SELECT name, id, count FROM routines WHERE user_id = ? ORDER BY count`
	);
	const routines = allRoutinesSql.all(id);

	const routineId = await select({
		message: "Choose a routine",
		choices: routines.map(line => {
			return { name: line.name, value: line.id };
		}),
	});

	const routineSql = database.prepare(
		`SELECT name, exer_id, position
        FROM routineexers
            JOIN exercises ON routineexers.exer_id = exercises.id
        WHERE routine_id = ?
        ORDER BY position`
	);
	const routine = routineSql.all(routineId);

	const runData = await checkbox({
		message:
			"Use spacebar to check off excercises as you finish them. Press enter to finish and exit the routine.",
		choices: routine.map(line => {
			return { name: line.name, value: line.exer_id };
		}),
	});

	const routineUpdateSql = database.prepare(
		`UPDATE routines SET count = count + 1 WHERE id = ?`
	);
	const routineUpdate = routineUpdateSql.run(routineId);

	const exerUpdateSql = database.prepare(
		`UPDATE exercises SET count = count + 1 WHERE id = ?`
	);

	runData.forEach(line => exerUpdateSql.run(line));

	database.close();
}
