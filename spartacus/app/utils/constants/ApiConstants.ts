export default {
    COMPONENTS: "country:IN",
    RADIUS: 500,
    PINCODES_RADIUS: 30000,
    FIELDS:  'name,formatted_address,address_components,geometry',
    EXPIRATION_TIME: {
        PINCODE_TO_LAT_LANG: 30 * 24 * 60 * 60, // 30 days
        DEFAULT: 60, // 1 min      
    },
    RADIUS_LIMIT: {
      
        UPPER_LIMIT:200000,
    },
    SOURCE_LIMIT:{
        UPPER_LIMIT:500
    }
}