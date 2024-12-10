interface PincodeData {
    pincode: Number;
    location: {
      type: string;
      coordinates: number[];
    };
    created_at: Date;
  updated_at: Date;
  }
  
export {PincodeData}