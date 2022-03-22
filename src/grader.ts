import { createReadStream } from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import path from 'path';

type Prop = {
  [prop: string]: string | number;
};

class Score {
  constructor(
    private _id: string,
    private _score: number,
    private _otherFileds: Prop
  ) {}

  get score() {
    return this._score;
  }
  get scoreFormatted() {
    return this._score.toFixed(2);
  }
  get id() {
    return this._id;
  }
  get otherFileds() {
    return this._otherFileds;
  }
  get description() {
    return Object.entries(this._otherFileds).reduce(
      (acc, [key, value]) => acc + ` | ${key}: ${value}`,
      ''
    );
  }
}

function getScores(scoreFilePath: string): Score[] {
  const workbook = xlsx.readFile(scoreFilePath);
  const firstSheet = workbook.SheetNames[0];

  // Get the data of "Sheet1"
  const rawdata: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);

  return rawdata.map(
    ({ id, score, ...props }: { id: string; score: number; props: any }) =>
      new Score(id, score, { ...props })
  );
}

class DiscordUser {
  constructor(
    private _discordID: string,
    private _name: string,
    private _id: string
  ) {}

  toString(): string {
    return `${this._name} (${this._id})`;
  }
}

function getDiscordUsers(participantsFilePath: string): Promise<DiscordUser[]> {
  return new Promise(async (resolve) => {
    const result: DiscordUser[] = [];

    const file = path.resolve('../data/participants.csv');

    createReadStream(participantsFilePath)
      .pipe(csv({ headers: ['name', 'id', 'discordID'], skipLines: 1 })) // skip first line
      .on(
        'data',
        ({
          id,
          name,
          discordID,
        }: {
          id: string;
          name: string;
          discordID: string;
        }) => {
          result.push(new DiscordUser(discordID, name, id));
        }
      )
      .on('end', () => {
        // console.log('CSV file successfully processed');
        resolve(result);
      });
  });
}
export { DiscordUser, getDiscordUsers, Score, getScores };
