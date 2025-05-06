import { Document, Schema, model } from 'mongoose';

interface huntersDocumentInterface extends Document {
  id: number,
  nombre: string,
  raza: 'humano' | 'elfo' | 'brujo' | 'enano' | 'fantasma',
  ubicacion: string,
}

const HunterSchema = new Schema<huntersDocumentInterface>({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
    //unique: true,
    trim: true,
  },
  raza: {
    type: String,
    required: true,
    trim: true,
    enum: ['humano', 'elfo', 'brujo', 'enano', 'fantasma'],
  },
  ubicacion: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
});

export const Hunter = model<huntersDocumentInterface>('Hunter', HunterSchema);