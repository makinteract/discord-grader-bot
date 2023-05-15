import xlsx from 'xlsx';
import path from 'path';

interface Participant {
  id: string;
  name: string;
  score: number;
  discordID: string;
}

interface DiscordUser {
  id: string;
  name: string;
  discordID: string;
}

interface MessageInfo {
  receipientName: string;
  receipientDiscordID: string;
  message: string;
}

let discordData: DiscordUser[] = [];

function getParticipantsData(filePath: string): Participant[] {
  const workbook = xlsx.readFile(filePath);
  const firstSheet = workbook.SheetNames[0];

  // Get the data of "Sheet1"
  const data: Participant[] = xlsx.utils.sheet_to_json(
    workbook.Sheets[firstSheet],
    { raw: false }
  );

  // Decorate all data with name and discordID
  data.forEach((p: Participant) => {
    const { id: pid, name } = p;
    const ddata = discordData.find(({ id }: DiscordUser) => id == pid);
    if (ddata) {
      p.name = ddata!.name;
      p.discordID = '' + ddata!.discordID;
    } else {
      throw new Error(`Unable to find user id ${pid} of name ${name}`);
    }
  });

  return data;
}

function loadDiscordUsers(filePath: string) {
  const workbook = xlsx.readFile(filePath);
  const firstSheet = workbook.SheetNames[0]; // Get the data of "Sheet1"

  const data: DiscordUser[] = xlsx.utils.sheet_to_json(
    workbook.Sheets[firstSheet]
  );
  discordData = data.map(({ id, name, discordID }: any) => ({
    id,
    name,
    discordID,
  }));
}

function generateMessage(data: Participant): MessageInfo {
  const { id, name, score, discordID, ...others } = data;
  const description = Object.entries(others).reduce(
    (str: string, [key, value]: any[], i: number) => {
      return str + `\n**${key}**: ${value}`;
    },
    ''
  );

  return {
    receipientName: name,
    receipientDiscordID: discordID,
    message:
      `Hi ${name} (${id}), your score is **${score} / 100**.` +
      `\n\nThe individual parts are graded this way: ${description}`,
  };
}

export {
  Participant,
  MessageInfo,
  getParticipantsData,
  loadDiscordUsers,
  discordData,
  generateMessage,
};
