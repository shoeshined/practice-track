import { DatabaseSync } from "node:sqlite";
import { select, checkbox } from "@inquirer/prompts";

export async function runRoutine(userId) {
	const database = new DatabaseSync("./database.db");

	const createHistorySql = `CREATE TABLE if not exists runhistory(
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        routinename TEXT NOT NULL,
		routinedescription TEXT,
        time INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
	)`;
	database.exec(createHistorySql);

	let createHistoryExersSql = `CREATE TABLE if not exists runhistoryexers(
        id INTEGER PRIMARY KEY,
		name TEXT,
        runhistory_id INTEGER,
        position INTEGER,
        FOREIGN KEY(runhistory_id) REFERENCES runhistory(id) ON DELETE CASCADE  
    )`;
	database.exec(createHistoryExersSql);

	const routinesListSql = database.prepare(
		`SELECT name, id, count, description FROM routines WHERE user_id = ? ORDER BY count`
	);
	const routinesList = routinesListSql.all(userId);

	const routine = await select({
		message: "Choose a routine",
		choices: routinesList.map(line => {
			return { name: line.name, value: line };
		}),
	});

	const routineSql = database.prepare(
		`SELECT name, exer_id, position
        FROM routineexers
            JOIN exercises ON routineexers.exer_id = exercises.id
        WHERE routine_id = ?
        ORDER BY position`
	);
	const routineExers = routineSql.all(routine.id);

	const runData = await checkbox({
		message:
			"Use spacebar to check off excercises as you finish them. Press enter to finish and exit the routine.",
		choices: routineExers.map(exer => {
			return { name: exer.name, value: exer };
		}),
	});

	const routineUpdateSql = database.prepare(
		`UPDATE routines SET count = count + 1 WHERE id = ?`
	);
	routineUpdateSql.run(routine.id);

	const exerUpdateSql = database.prepare(
		`UPDATE exercises SET count = count + 1 WHERE id = ?`
	);
	runData.forEach(exer => exerUpdateSql.run(exer.exer_id));

	const historyInsertSql = database.prepare(
		`INSERT INTO runhistory(user_id, routinename, routinedescription, time) VALUES (?,?,?,?)`
	);
	const historyId = historyInsertSql.run(
		userId,
		routine.name,
		routine.description,
		Date.now()
	).lastInsertRowid;

	const historyExersSql = database.prepare(
		`INSERT INTO runhistoryexers(name, runhistory_id, position) VALUES (?,?,?)`
	);

	runData.forEach((exer, ind) => {
		historyExersSql.run(exer.name, historyId, ind);
	});

	database.close();
}
