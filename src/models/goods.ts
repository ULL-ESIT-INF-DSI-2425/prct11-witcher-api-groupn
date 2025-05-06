import { Document, Schema, model } from 'mongoose';

/**
 * Interfaz que representa un documento de bien en la base de datos.
 * @extends Document
 * @property id - Identificador único del bien
 * @property nombre - Nombre del bien
 * @property descripcion - Descripción del bien
 * @property material - Material del que está hecho el bien
 * @property peso - Peso del bien en kilogramos
 * @property valor - Valor económico del bien
 * @property stock - Unidades disponibles del bien
 */
export interface goodsDocumentInterface extends Document {
  id: number,
  nombre: string,
  descripcion: string,
  material: string,
  peso: number,
  valor: number,
  stock: number,
}

/**
 * Esquema de Mongoose que define la estructura de los documentos de tipo bien.
 */
const GoodSchema = new Schema<goodsDocumentInterface>({
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
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  material: {
    type: String,
    required: true,
    trim: true,
  },
  peso: {
    type: Number,
    required: true,
    min: [0, 'El peso no puede ser negativo'],
  },
  valor: {
    type: Number,
    required: true,
    trim: true,
    validate(value: number) {
        if (value < 0) {
            throw new Error('Valor del bien debe de ser mayor que 0');
        }
    }
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'El stock no puede ser negativo'],
    default: 1,
  }
});

export const Good = model<goodsDocumentInterface>('Good', GoodSchema);