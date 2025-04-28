import { Document, Schema, model } from 'mongoose';

interface goodsDocumentInterface extends Document {
  id: number,
  nombre: string,
  descripcion: string,
  material: string,
  peso: number,
  valor: number,
}

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
    trim: true,
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
});

export const Good = model<goodsDocumentInterface>('Good', GoodSchema);