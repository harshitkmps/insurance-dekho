/**
 * Author - Ankit Shukla
 * Usage  - import and route all dependency modules.
 */

import ConfigRouter from './routers/ConfigRouter';
import GeoCodingRouter from '@routers/GeocodingRouter';

module.exports = (app: any) => {
    app.use('/api/config', ConfigRouter.router);
    app.use('/api/v1', GeoCodingRouter.router);
   
}