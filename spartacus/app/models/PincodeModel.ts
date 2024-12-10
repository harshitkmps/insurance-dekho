import mongoose, { Document, Model } from 'mongoose';
import Mongo from '@app/config/dbs/Mongo';
import tables from '@app/config/dbs/Tables';
import { PincodeData } from '@app/interfaces/pincode';
const pincodeSchema = new mongoose.Schema<PincodeData>(
  {
    pincode: Number,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: tables.MONGO.PINCODES }
);

pincodeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});


pincodeSchema.index({ location: '2dsphere' }); //creating index on location field as geospatial index
pincodeSchema.index({ pincode: 1 }, { unique: true });

const PincodeModel = Mongo.mongoDatabase.model('pincodes', pincodeSchema);


export default PincodeModel;

