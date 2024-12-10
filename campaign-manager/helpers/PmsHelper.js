const CommonHelper = require('./CommonHelper');

const createPointsBulk = async (data) => {
    try {
        const options = {
            protocol: config.pms.protocol,
            host: config.pms.host,
            path: '/pms/v1/points/bulk',
            method: 'POST',
            headers: {
                'x-api-key': config.pms.xAuthToken,
                'Content-Type': 'application/json',
            },
        };
        const body = {
            points: data
        };
        console.log('pms request body', JSON.stringify(body));
        const result = await CommonHelper.sendPostRequest(body, options);
        console.log('pms response data', JSON.stringify(result));
        return result.data && result.data.points && result.data.points.length > 0 ? result.data.points : [];
    } catch (e) {
        console.error(`error in pms data:${JSON.stringify(data)} error: ${JSON.stringify(e)}`);
        return [];
    }
}

module.exports = {
  createPointsBulk, 
};