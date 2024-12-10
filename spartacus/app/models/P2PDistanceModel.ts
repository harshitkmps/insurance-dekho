import mongoose, { Document, Model } from 'mongoose';
import Mongo from '@app/config/dbs/Mongo';
import tables from '@app/config/dbs/Tables';
import { DistanceTimeData } from '@app/interfaces/distance_time';
import logger from '@app/config/services/WinstonConfig';
const p2pSchema = new mongoose.Schema<DistanceTimeData>(
  {
    
    source: Number,
    destination: Number,
    distance: Number,
    time: Number,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },                                                                                                                                                                                
  { collection: tables.MONGO.P2PDistance }
);

p2pSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});
p2pSchema.index({ source: 1, destination: 1 });


const P2PDistanceModel = Mongo.mongoDatabase.model('p2p_distance_matrix', p2pSchema);

export class P2PData {
  public static async insertData(data: any) {
    try {
      // Insert documents using the model
      const result = await P2PDistanceModel.insertMany(data);
      logger.info(` p2p documents inserted successfully:${result}`);
    } catch (error) {
      logger.error('Error inserting documents in p2p :', error);
    }

  }

}
export default P2PDistanceModel;