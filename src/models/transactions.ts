import { Document, Schema, Types, model } from 'mongoose';

import { Good } from './goods.js';
import { Hunter } from './hunters.js';
import { Merchant } from './merchants.js';

/**
 * Interfaz que representa un documento de transacción en la base de datos.
 * @extends Document
 * @property id - Identificador único de la transacción
 * @property tipo - Tipo de transacción (venta, compra o devolución)
 * @property fecha - Fecha en la que se realizó la transacción
 * @property cazador - Referencia al cazador involucrado (si aplica)
 * @property mercader - Referencia al mercader involucrado (si aplica)
 * @property bienes - Lista de bienes involucrados junto con su cantidad
 * @property valor - Valor total de la transacción
 */
interface transactionsDocumentInterface extends Document {
  id: number,
  tipo: 'venta' | 'compra' | 'devolucion', // ENUM
  fecha: Date,
  cazador?: Types.ObjectId,
  mercader?: Types.ObjectId,
  bienes: {
    bien: Types.ObjectId,
    cantidad: number,
  } [], //
  valor: number,
}

/**
 * Esquema de Mongoose que define la estructura de los documentos de tipo transacción.
 */
const TransactionSchema = new Schema<transactionsDocumentInterface>({
  id: {
    type: Number,
    unique: true,
    required: true,
    min: [0, 'Los ids deben ser positivos'],
  },
  tipo: {
    type: String,
    required: true,
    trim: true,
    enum: ['venta', 'compra', 'devolucion'],
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
  },
  cazador: {
    type: Schema.Types.ObjectId,
    ref: 'Hunter',
    required: function() {return this.tipo === 'compra';},
  },
  mercader: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: function() { return this.tipo === 'venta';},
  },
  bienes: [{
    bien: {
      type: Schema.Types.ObjectId,
      ref: 'Good',
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'Al menos 1 de cantidad'],
    }
  }],
  valor: {
    type: Number,
    required: true,
    trim: true,
    validate(value: number) {
        if (value < 0) {
            throw new Error('Valor de la transaccion debe ser mayor que 0');
        }
    }
  }
});

//valor de la transaccion
/*TransactionSchema.pre('save', async function (next) {
  let valorTotal = 0;

  for (const item of )
})*/

/**
 * Modelo de Mongoose para la colección de transacciones.
 */
export const Transaction = model<transactionsDocumentInterface>('Transaction', TransactionSchema);