import { DatabaseSync } from "node:sqlite";
import { select, checkbox } from "@inquirer/prompts";

export async function runRoutine(userId) {
	const database = new DatabaseSync("./database.db");

	const routinesListSql = database.prepare(
		`SELECT name, id, count FROM routines WHERE user_id = ? ORDER BY count`
	);
	const routinesList = routinesListSql.all(userId);

	const routineId = await select({
		message: "Choose a routine",
		choices: routinesList.map(line => {
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
		choices: routine.map(exer => {
			return { name: exer.name, value: exer.exer_id };
		}),
	});

	const routineUpdateSql = database.prepare(
		`UPDATE routines SET count = count + 1 WHERE id = ?`
	);
	routineUpdateSql.run(routineId);

	const exerUpdateSql = database.prepare(
		`UPDATE exercises SET count = count + 1 WHERE id = ?`
	);
	runData.forEach(exer => exerUpdateSql.run(exer));

	database.close();
}
