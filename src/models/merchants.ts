import { Document, Schema, model } from 'mongoose';

/**
 * Interfaz que representa un documento de mercader en la base de datos.
 * @extends Document
 * @property id - Identificador único del mercader
 * @property nombre - Nombre del mercader
 * @property tipo - Tipo de mercader (herrero, vendedor ambulante, alquimista, carpintero, curandero)
 * @property ubicacion - Ubicación actual del mercader
 */
interface merchantsDocumentInterface extends Document {
  id: number,
  nombre: string,
  tipo: 'herrero' | 'vendedor ambulante' | 'alquimista' | 'carpintero' | 'curandero',
  ubicacion: string,
}

/**
 * Esquema de Mongoose que define la estructura de los documentos de tipo mercader.
 */
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

/**
 * Modelo de Mongoose para la colección de mercaderes.
 */
export const Merchant = model<merchantsDocumentInterface>('Merchant', MerchantSchema);