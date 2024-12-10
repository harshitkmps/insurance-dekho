/**
 * Author   -   Ankit Shukla
 */

const router = require('express').Router({
    caseSensitive: true,
    strict: true
});

import ConfigController from '@app/controllers/ConfigController';

router.post(
    '/create-config',
    ConfigController.createConfiguration
);

router.post(
    '/set-config',
    ConfigController.setConfiguration
);

router.get(
    '/sync-config',
    ConfigController.getConfiguration
);

export default {
    router: router
};