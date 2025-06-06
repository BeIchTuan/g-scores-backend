import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { StudentModel } from '../infrastructure/database/mongoose/models/student.model';
import { connectDB } from '../infrastructure/database/mongoose/connection';

const CSV_FILE_PATH = path.join(__dirname, '../dataset/diem_thi_thpt_2024.csv');
const BATCH_SIZE = 1000; 

const readCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const parseScore = (value: string | undefined): number | null => {
  if (!value || value.trim() === '') return null;
  return parseFloat(value.replace(',', '.')) || null;
};

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const rows = await readCSV(CSV_FILE_PATH);
    console.log(`Read ${rows.length} rows from CSV`);

    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);
    console.log(`Will process data in ${totalBatches} batches of ${BATCH_SIZE} records each`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, rows.length);
      const batchRows = rows.slice(start, end);

      const students = batchRows.map((row) => ({
        sbd: row.sbd,
        toan: parseScore(row.toan),
        ngu_van: parseScore(row.ngu_van),
        ngoai_ngu: parseScore(row.ngoai_ngu),
        ma_ngoai_ngu: row.ma_ngoai_ngu || null,
        vat_li: parseScore(row.vat_li),
        hoa_hoc: parseScore(row.hoa_hoc),
        sinh_hoc: parseScore(row.sinh_hoc),
        lich_su: parseScore(row.lich_su),
        dia_li: parseScore(row.dia_li),
        gdcd: parseScore(row.gdcd),
      }));

      await StudentModel.insertMany(students, { ordered: false });
      console.log(`Completed batch ${batchIndex + 1}/${totalBatches} (${start + 1}-${end} of ${rows.length} records)`);
    }

    console.log('Data seeding completed successfully');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData();
