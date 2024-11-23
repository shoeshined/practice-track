import { DatabaseSync } from "node:sqlite";
import { input } from "@inquirer/prompts";

export async function new_exer(userId) {
	const database = new DatabaseSync("./database.db");

	let createExersSql = `CREATE TABLE if not exists exercises(
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        key INTEGER,
        bpm INTEGER,
        count INTEGER,
		FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
	database.exec(createExersSql);

	const name = await input({ message: "Name:" }),
		description = await input({ message: "Descrition (optional):" }),
		key = await input({ message: "Key (optional):" }),
		bmp = await input({ message: "BPM (optional):" });

	const exerInsertSql = database.prepare(
		`INSERT INTO exercises(user_id, name, description, key, bpm, count) VALUES (?,?,?,?,?,?)`
	);
	exerInsertSql.run(userId, name, description, key, bmp, 0);

	database.close();
}
