import { Document, Schema, Types, model } from 'mongoose';

// MAL IMPLEMENTADO
// HAY QUE CREAR RELACIONES ENTRE LOS MODELOS GOOD, HUNTER y MERCHANT, autocalcular valor
import { Good } from './goods.js';
import { Hunter } from './hunters.js';
import { Merchant } from './merchants.js';

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

const TransactionSchema = new Schema<transactionsDocumentInterface>({
  id: {
    type: Number,
    unique: true,
    required: true,
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

export const Transaction = model<transactionsDocumentInterface>('Transaction', TransactionSchema);