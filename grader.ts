import { createReadStream } from 'fs';
import path from 'path';
import csv from 'csv-parser';
import xlsx from 'xlsx';

type Student = {
  ID: string;
  name: string;
  discordID: string;
};

type Score = {
  ID: string;
  name: string;
  homework: string;
  score: number;
  average: number;
  notes: string;
  summary: string;
  [prop: string]: string | number;
};

function getStudents(participantsFile: string): Promise<Student[]> {
  return new Promise(async (resolve) => {
    const inputFile = path.resolve(__dirname, 'data', participantsFile);
    const result: Student[] = [];
    createReadStream(inputFile)
      .pipe(csv({ headers: ['ID', 'name', 'discordID'], skipLines: 1 })) // skip first line
      .on('data', (row: Student) => {
        result.push(row);
      })
      .on('end', () => {
        // console.log('CSV file successfully processed');
        resolve(result);
      });
  });
}

function getScores(scoreFileName: string) {
  const inputFile = path.resolve(__dirname, 'data', scoreFileName);

  const workbook = xlsx.readFile(inputFile);
  const sheetNames = workbook.SheetNames;

  // Get the data of "Sheet1"
  const data: Score[] = xlsx.utils.sheet_to_json(
    workbook.Sheets[sheetNames[0]]
  );

  // Create a summary
  data.map((fields: Score) => {
    fields.summary = createSummary(fields);
    return fields;
  });

  return data;
}

function createSummary(scoreData: Score) {
  const { ID, name, score, homework, average, notes, ...others } = scoreData;

  const scores = Object.entries(others);

  const scoreText = scores.reduce(
    (acc: string, part: any) => acc + part[0] + ': ' + part[1] + ' | ',
    ''
  );

  let message = `Hello ${name}. For ${homework} you received a score of **${score}** out of an average of **${average}**.\n`;
  message += `This are the scores for the individual parts: ${scoreText}`;
  message += `Notes:  ${notes}`;
  return message;
}

export { getStudents, getScores, Student, Score };
