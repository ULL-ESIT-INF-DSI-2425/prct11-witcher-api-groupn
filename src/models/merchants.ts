import { Document, Schema, model } from 'mongoose';

interface merchantsDocumentInterface extends Document {
  id: number,
  nombre: string,
  tipo: 'herrero' | 'vendedor ambulante' | 'alquimista' | 'carpintero' | 'curandero',
  ubicacion: string,
}

const MerchantSchema = new Schema<merchantsDocumentInterface>({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
    unique:true,
    trim: true,
  },
  tipo: {
    type: String,
    required: true,
    trim: true,
    enum: ['herrero', 'vendedor ambulante', 'alquimista', 'carpintero', 'curandero'],
  },
  ubicacion: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
});

export const Merchant = model<merchantsDocumentInterface>('Merchant', MerchantSchema);