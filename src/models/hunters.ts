import { Document, Schema, model } from 'mongoose';

/**
 * Interfaz que representa un documento de cazador en la base de datos.
 * @extends Document
 * @property id - Identificador único del cazador
 * @property nombre - Nombre del cazador
 * @property raza - Raza del cazador (humano, elfo, brujo, enano o fantasma)
 * @property ubicacion - Ubicación actual del cazador
 */
interface huntersDocumentInterface extends Document {
  id: number,
  nombre: string,
  raza: 'humano' | 'elfo' | 'brujo' | 'enano' | 'fantasma',
  ubicacion: string,
}

/**
 * Esquema de Mongoose que define la estructura de los documentos de tipo cazador.
 */
const HunterSchema = new Schema<huntersDocumentInterface>({
  id: {
    type: Number,
    unique: true,
    required: true,
    min: [0, 'Los ids deben ser positivos'],
  },
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
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