import React, { useEffect } from "react";

import fp from "../utils/fp";

export default function FingerPrint() {
  useEffect(() => {
    fp();
  }, []);
  return (
    <div>
      Collecting Browser FingerPrint Data...
      <span id="expand-image"></span>
    </div>
  );
}
