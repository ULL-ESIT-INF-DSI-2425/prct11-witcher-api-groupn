import { Document, Schema, model } from 'mongoose';

interface huntersDocumentInterface extends Document {
  id: number,
  nombre: string,
  raza: string,
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
    trim: true,
  },
  raza: {
    type: String,
    required: true,
    trim: true,
  },
  ubicacion: {
    type: String,
    required: true,
    trim: true,
  },
});

export const Hunter = model<huntersDocumentInterface>('Hunter', HunterSchema);