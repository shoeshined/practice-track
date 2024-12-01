import { DatabaseSync } from "node:sqlite";
import { select } from "@inquirer/prompts";
import chalk from "chalk";

export async function viewHistory(userId) {
	const database = new DatabaseSync("./database.db");

	let historySql, runHistory;

	try {
		historySql = database.prepare(`SELECT * FROM runhistory 
        WHERE user_id = ?
        ORDER BY time DESC`);
		runHistory = historySql.all(userId);
		if (runHistory.length === 0) throw "";
	} catch {
		console.log(chalk.yellowBright("You haven't run a routine yet!"));
		return;
	}

	const listRuns = runHistory.map(run => {
		let time = new Date(run.time);
		return {
			name: `${Intl.DateTimeFormat().format(time)}: ${run.routinename}`,
			value: run,
		};
	});

	const runChoice = await select({
		message: "Choose a run to see details",
		choices: [{ name: "Back to main menu", value: "done" }, ...listRuns],
		loop: false,
	});

	if (runChoice === "done") return;

	const getRunSql = database.prepare(
		`SELECT e.name
        FROM runhistoryexers e
            JOIN runhistory h ON e.runhistory_id = h.id
        WHERE e.runhistory_id = ?
        ORDER BY position`
	);

	let exersString = getRunSql
		.all(runChoice.id)
		.map((line, ind) => `${ind + 1}) ${line.name}`)
		.join("\n");
	let runTime = new Date(runChoice.time);

	console.log(
		chalk.magenta(
			`\n${Intl.DateTimeFormat(undefined, {
				dateStyle: "long",
				timeStyle: "short",
			}).format(runTime)}\n`
		) +
			chalk.blue.bold.underline(`${runChoice.routinename}\n`) +
			chalk.yellowBright(
				runChoice.description ? `~${runChoice.description}~\n\n` : `\n`
			) +
			chalk.green(`${exersString}\n`)
	);

	await viewHistory(userId);
	database.close();
}
