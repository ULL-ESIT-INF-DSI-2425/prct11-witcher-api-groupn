import { Document, Schema, model } from 'mongoose';

interface merchantsDocumentInterface extends Document {
  id: number,
  nombre: string,
  tipo: string,
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
    trim: true,
  },
  tipo: {
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

export const Merchant = model<merchantsDocumentInterface>('Merchant', MerchantSchema);