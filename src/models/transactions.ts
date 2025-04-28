import { Document, Schema, model } from 'mongoose';

// MAL IMPLEMENTADO
// HAY QUE CREAR RELACIONES ENTRE LOS MODELOS GOOD, HUNTER y MERCHANT, autocalcular valor


interface transactionsDocumentInterface extends Document {
  id: number,
  tipo: 'venta' | 'compra' | 'devolucion', // ENUM
  fecha: string,
  bien: string, //
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
  },
  fecha: {
    type: String,
    required: true,
    trim: true,
  },
  bien: {
    type: String,
    required: true,
    trim: true,
  },
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

export const Transaction = model<transactionsDocumentInterface>('Transaction', TransactionSchema);