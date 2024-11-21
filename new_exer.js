import { DatabaseSync } from "node:sqlite";
import { input } from "@inquirer/prompts";

export async function new_exer(userId) {
	const database = new DatabaseSync("./test.db");

	let createExers = `CREATE TABLE if not exists exercises(
        id INTEGER PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        key INTEGER,
        bpm INTEGER,
        count INTEGER
    )`;
	database.exec(createExers);

	const name = await input({ message: "Name:" }),
		description = await input({ message: "Descrition (optional):" }),
		key = await input({ message: "Key (optional):" }),
		bmp = await input({ message: "BPM (optional):" });

	const exerInsert = database.prepare(
		`INSERT INTO exercises(user_id, name, description, key, bpm, count) VALUES (?,?,?,?,?,?)`
	);
	exerInsert.run(userId, name, description, key, bmp, 0);

	database.close();
}