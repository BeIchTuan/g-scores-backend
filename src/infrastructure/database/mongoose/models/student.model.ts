import { Schema, model } from 'mongoose';
import { Student } from '../../../../domain/entities/student';

const studentSchema = new Schema<Student>({
  sbd: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  toan: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  ngu_van: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  ngoai_ngu: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  ma_ngoai_ngu: { 
    type: String,
    default: null 
  },
  vat_li: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  hoa_hoc: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  sinh_hoc: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  lich_su: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  dia_li: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  },
  gdcd: { 
    type: Number,
    min: 0,
    max: 10,
    default: null 
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

studentSchema.index({ toan: 1 });
studentSchema.index({ vat_li: 1 });
studentSchema.index({ hoa_hoc: 1 });
studentSchema.index({ ngu_van: 1 });
studentSchema.index({ ngoai_ngu: 1 });
studentSchema.index({ sinh_hoc: 1 });
studentSchema.index({ lich_su: 1 });
studentSchema.index({ dia_li: 1 });
studentSchema.index({ gdcd: 1 });

studentSchema.virtual('natural_science_average').get(function() {
  const scores = [this.vat_li, this.hoa_hoc, this.sinh_hoc].filter(score => score !== null);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
});

studentSchema.virtual('social_science_average').get(function() {
  const scores = [this.lich_su, this.dia_li, this.gdcd].filter(score => score !== null);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
});

export const StudentModel = model<Student>('Student', studentSchema);