import decompress from 'decompress';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import sqlite from 'sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDirectory = path.resolve(`${__dirname}/../../data`);
const tempFileDirectory = path.resolve(`${__dirname}/../../data/temp`);

const files = fs.readdirSync(dataDirectory).filter(f => f.endsWith('.zip'));

for (const file of files) {
  console.log(file);
  decompress(`${dataDirectory}/${file}`, `${tempFileDirectory}/unzipped`)
    .then((files: { path: string; data: Buffer }[]) => {
      const sqlFile = files.find((f) => f.path.endsWith('.sql'));
      fs.writeFileSync(`${tempFileDirectory}/temp.sql`, sqlFile.data);

      const db = new sqlite.Database(`${tempFileDirectory}/temp.sql`);
      db.all('select * from zwaiter', function (_err, rows) {
        console.log('zwaiter', rows);
      });
      db.all('select * from zrole', function (_err, rows) {
        console.log('zrole', rows);
      });
      db.all('select * from zwaiterrole', function (_err, rows) {
        console.log('zwaiterrole', rows);
      });
      fs.rmSync(`${tempFileDirectory}/unzipped`, { recursive: true, force: true })
    })
    .catch((error) => {
      console.error(error);
    });
}
