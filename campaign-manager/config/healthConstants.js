const crmStatus = {
    FRESH : {
        ID: 1,
        SS : {
            NOT_YET_CALLED : 1
        }
    },
    RIGHT_PARTY_CONTACT:{
        ID: 2,
        SS : {
            CALL_BACK : 2,
            CALLDROP_BUSY_RINGING_NC : 9, // SWITCH OFF / NOT REACHABLE
        }
    },
    WRONG_PARTY_CONTACT:{
        ID: 3,
        SS : {
            REFER_TO_OTHER_PRODUCT : 15
        }
    },
    NOT_CONTACTABLE:{
        ID: 4,
        SS : {
        //ERI_AGENT_ERROR : 90,
        //PDROP_PREROUTING_DROP : 89,
        //ADC_AUTO_DISCONNECT : 88,
        NOT_REACHABLE : 16,
        SWITCH_OFF : 17,
        RINGING : 92,
        ERI_AGENT_ERROR : 87,
        PDROP_PREROUTING_DROP : 86,
        ADC_AUTO_DISCONNECT : 85,
        B_BUSY : 24,
        NA_NOT_ANSWERED : 18  
        }
    },
    CLOSED:{
        ID: 5,
        SS : {
            NOT_ELLIGIBLE : 74,
            NOT_INTERSTED : 75,
            LANGUAGE_BARRIER : 10,
            TEST_LEAD : 19,
            BOOKED_ELSEWHERE : 76,
            NC_AUTO_CLOSE : 28,
            NC_CLOSE_MANUAL : 54,
            REVISIT_AUTO_CLOSE : 81,
            INACTIVE_USER_CLOSE_LEADS : 82,
            AUTO_CLOSE_NI_RPC : 83,
            AUTO_CLOSE_NI_INTERSTED : 84,
            PURCHASED_FROM_SOMEWHERE_ELSE: 109,
            PRICE_TOO_HIGH : 108,
            B2B_PARTNER_DENIED: 114
        }
    },
    WELCOME_CALL : {
        ID: 6,
        SS : {

        }
    },
    MEDICAL_CASES:{
        ID : 7,
        SS : {
            DOCUMENT_AWAITED : 29,
            MEDICAL_AWAITED : 30,
            REFUND_REQUEST : 31,
            REFUND_PROCESS : 32,
            DOC_SENT_TO_INSURER : 33,
            ADDITIONAL_DOC_REQUIRED : 34,
            REFER_OK: 35,
            ENDORSEMENT : 36,
            FOLLOWUP_WITH_INSURER : 37,
            UNDERWITING_DECISION_AWAITED : 38,
            POLICY_ISSUED : 39,
            REFER_BACK_TO_SALES : 40,
            DOCUMENT_RECEIVED : 41,
            CALL_BACK : 42,
            POLICY_DECLINE : 43,
            WELCOME_CALL_PENDING : 55,
            RINGING : 57,
            SWITCH_OFF : 59,
            ODD_TONE: 61,
            FOLLOW_UP : 63,
            FREE_LOOK_CANCELLATION : 65,
            POLICY_CANCELLED : 67,
            SOFTCOPY_NOT_RECEIVE : 68,
            NOT_ATTRIBUTED : 79,
        }
    },
    NON_MEDICAL_CASES:{
        ID : 8,
        SS : {
            REFER_BACK_TO_SALES : 44,
            REFUND_REQUEST : 45,
            POLICY_CANCELLED : 46,
            ENDORSEMENT : 47,
            FREE_LOOK_CANCELLATION : 48,
            //REFUND_REQUEST : 49,
            REFUND_PROCESS : 50,
            CALL_BACK : 51,
            POLICY_ISSUED : 52,
            REFER_OK : 53,
            WELCOME_CALL_PENDING : 56,
            RINGING : 58,
            SWITCH_OFF : 60,
            ODD_TUNE : 62,
            FOLLOW_UP : 64,
            POLICY_DECLINE : 66,
            SOFTCOPY_NOT_RECEIVE : 69,
            NOT_ATTRIBUTED : 78
        }
    },
    INTERSTED:{
        ID: 9,
        SS : {
            PAYMENT_DONE : 5,
            PAYMENT_FAILED : 91,
            CALLBACK : 70,
            CALLDROP_BUSY_RINGING_NC : 72,
            WELCOME_PENDING : 27,
            CONFIRMATION_PENDING: 93
        }
    },
    WRONG_BOOKING:{
        id: 10,
        sub_status : {
            INVALID_BOOKING : 80
        }
    },
    RENEW:{
        ID: 11,
        SS : {
            CALLBACK : 85,
            FOLLOW_UP : 86,
            NOT_RENEWED : 87,
            PENDING : 88,
            PORTABILITY : 89,
            RENEWED : 90,
            NON_CONTACTABLE : 91,
        }
    },
    MEETING:{
        ID: 11,
        SS : {
            CALLBACK : 94,
            NOT_INTERESTED: 95,
            CALLDROP_BUSY_RINGING_NC : 96,
            SCHEDULED: 97,
            // RESCHEDULE: 98,
            MISSED: 99,
            NO_SHOW: 100,
            RESCHEDULED: 101,
            HELP_CUSTOMER: 102,
            LEFT_FOR_MEETING: 103,
            AGENT_REACHED: 104,
            STARTED: 105,
            PAYMENT_DONE: 106,
            REQUESTED: 107,
            FOLLOWUP_CUSTOMER_NEEDS_TIME: 110,
            FOLLOWUP_CUSTOMER_NEEDS_MORE_INFO: 111,
            FOLLOWUP_CUSTOMER_UNREACHABLE: 112,
            FOLLOWUP_CUSTOMER_DELAYS_MEETING: 113,
            RESCHEDULE_REQUEST_CUSTOMER_INITIATED: 115,
            RESCHEDULE_REQUEST_CUSTOMER_NEEDS_TIME: 116,
            RESCHEDULE_REQUEST_CUSTOMER_NEEDS_MORE_INFO: 117,
            RESCHEDULE_REQUEST_CUSTOMER_ISNT_AVAILABLE: 118,
            RESCHEDULE_REQUEST_PARTNER_UNAVAILABLE: 119,
            OFFLINE_PAYMENT_DONE: 120,
            
        }
    }
}

const meetingStatus = {
    REQUESTED: {
        ID: 1,
        SS: {
            ID: 1,
            PRIORITY: 1
        }
    },
    CONFIRMED: {
        ID: 2,
        SS: {
            ID: 2,
            PRIORITY: 2
        }
    },
    SCHEDULED: {
        ID: 3,
        SS: {
            ID: 3,
            PRIORITY: 3
        }
    },
    IN_PROGRESS: {
        ID: 4,
        SS: {
            AGENT_LEFT_FOR_MEETING: {
                ID: 4,
                PRIORITY: 4
            },
            AGENT_REACHED: {
                ID: 5,
                PRIORITY: 5
            },
            STARTED: {
                ID: 6,
                PRIORITY: 6
            },
        }
    },
    MEETING_DONE: {
        ID: 5,
        SS: {
            PAYMENT_DONE: {
                ID: 7,
                PRIORITY:7
            },
            RESCHEDULE_REQUEST_CUSTOMER_INITIATED: {
                ID: 8,
                PRIORITY:8
            },
            RESCHEDULE_REQUEST_CUSTOMER_NEEDS_MORE_INFO: {
                ID: 9,
                PRIORITY:8
            },
            FOLLOWUP_CUSTOMER_NEEDS_TIME: {
                ID: 10,
                PRIORITY:8
            },
            FOLLOWUP_CUSTOMER_NEEDS_MORE_INFO: {
                ID: 11,
                PRIORITY:8
            },
            RESCHEDULE_REQUEST_CUSTOMER_NEEDS_TIME: {
                ID: 12,
                PRIORITY:8
            },
            RESCHEDULE_REQUEST_CUSTOMER_ISNT_AVAILABLE: {
                ID: 25,
                PRIORITY:8
            },
            CLOSED: {
                ID: 13,
                PRIORITY:9
            },
            B2B_PARTNER_DENIED: {
                ID: 30,
                PRIORITY: 11
            }
        }
    },
    MEETING_NOT_DONE: {
        ID: 6,
        SS: {
            PAYMENT_DONE: {
                ID: 14,
                PRIORITY: 10
            },
            RESCHEDULE_REQUEST_CUSTOMER_INITIATED: {
                ID: 15,
                PRIORITY: 11
            },
            RESCHEDULE_REQUEST_CUSTOMER_NEEDS_MORE_INFO: {
                ID: 16,
                PRIORITY: 11
            },
            FOLLOWUP_CUSTOMER_NEEDS_TIME: {
                ID: 17,
                PRIORITY: 11
            },
            FOLLOWUP_CUSTOMER_NEEDS_MORE_INFO: {
                ID: 18,
                PRIORITY: 11
            },
            RESCHEDULE_REQUEST_CUSTOMER_NEEDS_TIME: {
                ID: 19,
                PRIORITY: 11
            },
            RESCHEDULE_REQUEST_CUSTOMER_ISNT_AVAILABLE: {
                ID: 26,
                PRIORITY:11
            },
            FOLLOWUP_CUSTOMER_DELAYS_MEETING: {
                ID: 27,
                PRIORITY:11
            },
            FOLLOWUP_CUSTOMER_UNREACHABLE: {
                ID: 28,
                PRIORITY:11
            },
            CLOSED: {
                ID: 20,
                PRIORITY: 12
            },
            FOLLOWUP_CUSTOMER_DELAYS_MEETING: {
                ID: 27,
                PRIORITY: 11
            },
            FOLLOWUP_CUSTOMER_UNREACHABLE: {
                ID: 28,
                PRIORITY: 11
            },
            B2B_PARTNER_DENIED: {
                ID: 29,
                PRIORITY: 11
            }
        }
    },
    RESCHEDULED: {
        ID: 7,
        SS: {
            ID: 21,
            PRIORITY: 13
        }
    },
    PAYMENT_DONE: {
        ID: 8,
        SS: {
            ONLINE: {
                ID: 22,
                PRIORITY:14
            },
            OFFLINE: {
                ID: 23,
                PRIORITY: 14 }

        }
    },
    MEETING_CLOSED: {
        ID: 9,
        SS: {
            ID: 24,
            PRIORITY: 15
        }
    }
};

module.exports = {
    crmStatus: crmStatus,
    meetingStatus: meetingStatus
};