import { Document, Schema, model } from 'mongoose';

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
 * Represents the schema for a good entity in the system.
 *
 * This schema defines the structure for goods including required attributes such as a unique identifier,
 * name, description, material, weight, monetary value, and stock count.
 *
 * @property {number} id - A unique identifier for the good. This value is required and must be unique.
 * @property {string} nombre - The name of the good. This field is required and will be trimmed.
 * @property {string} descripcion - A description of the good. This field is required and will be trimmed.
 * @property {string} material - The material from which the good is made. This field is required and will be trimmed.
 * @property {number} peso - The weight of the good. This value is required and must be a non-negative number.
 * @property {number} valor - The monetary value of the good. This field is required, ensuring the value is non-negative.
 *    A custom validator is provided to throw an error if the value is less than 0.
 * @property {number} stock - The available stock count for the good. This value is required, should be non-negative,
 *    and defaults to 1.
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