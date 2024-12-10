import moment from "moment"

export default {

    CORRELATOR : {
        X_CORRELATION_ID : "x-correlation-id",
    },
    
    MOMENT: {
        UTC : {
            IST: "+05:30",
        },
        DATE_TIME_FORMATS : {
            DEFAULT : "YYYY-MM-DD HH:mm:ss.SS",
        },
    },

    REQUEST : {
        METHOD : {
            GET     :   "GET",
            POST    :   "POST",
        },
    },

    STACK_TRACE : {
        TYPE : {
            SUCCESS : 'success',
            FAILURE : 'failure',
            LOG   : 'logging',
        }
    }
}