export const VehicleTypes = [
  {
    key: 1,
    value: "Bike",
  },
  {
    key: 2,
    value: "Private Car",
  },
  {
    key: 8,
    value: "Passenger Carrying Vehicle",
  },
  {
    key: 9,
    value: "Goods Carrying Vehicle",
  },
  {
    key: 4,
    value: "Misc",
  },
];

export const VehicleSubTypes = [
  {
    key: 10,
    value: "Bike",
  },
  {
    key: 19,
    value: "Scooter",
  },
  {
    key: 9,
    value: "Car",
  },
  {
    key: 8,
    value: "Bus",
  },
  {
    key: 9,
    value: "Car",
  },
  {
    key: 15,
    value: "Auto Rickshaw",
  },
  {
    key: 16,
    value: "E-Rickshaw",
  },
  {
    key: 2,
    value: "Pick up Van",
  },
  {
    key: 7,
    value: "Truck",
  },
  {
    key: 12,
    value: "Bulker",
  },
  {
    key: 1,
    value: "Dumper",
  },
  {
    key: 11,
    value: "Refrigerated Van",
  },
  {
    key: 6,
    value: "Tanker",
  },
  {
    key: 3,
    value: "Tipper",
  },
  {
    key: 5,
    value: "Tractor",
  },
  {
    key: 4,
    value: "Trailer",
  },
  {
    key: 17,
    value: "Auto",
  },
  {
    key: 22,
    value: "DELIVERY VAN",
  },
  {
    key: 23,
    value: "ECART",
  },
  {
    key: 24,
    value: "GARBAGE CARRIER",
  },
  {
    key: 25,
    value: "CHICKEN CARRIER",
  },
  {
    key: 26,
    value: "E GARBAGE CARRIER",
  },
  {
    key: 27,
    value: "ERICKSHAW",
  },
  {
    key: 13,
    value: "Construction Equipments",
  },
  {
    key: 14,
    value: "Agricultural Equipments",
  },
  {
    key: 18,
    value: "Agricultural Tractor",
  },
  {
    key: 21,
    value: "Garbage Van",
  },
];

export const defaultVehicleSubType = {
  1: 10,
  2: 9,
};

export const vehicleTypeTpTenureMapping = {
  1: 5,
  2: 3,
  8: 1,
  9: 1,
  4: 1,
};

export const vehicleTypeMapping = {
  "1": "tw/getAsyncQuotes",
  "2": "fw/getAsyncQuotes",
  "4": "cv/getAsyncQuotes",
  "8": "cv/getAsyncQuotes",
  "9": "cv/getAsyncQuotes",
};

export const policyTypeVsId = {
  comprehensive: 1,
  third_party: 2,
  own_damage: 3,
};

export const FETCH_DATA_VEHICLE_TYPE = {
  2: "fw_mmv",
  4: "cfw_mmv",
  8: "cfw_mmv",
  9: "cfw_mmv",
};

export const BOOKING_RENEWAL_DAYS = 60;
