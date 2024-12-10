import { Service } from "typedi";

const operatorTypeMap = {
  equals: (rowData: any, csvKey: string, conditions: any[], value: any) => {
    let conditionsMatch = true;
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      if (!matchValue) {
        conditionsMatch = false;
        break;
      }
    }
    if (!conditionsMatch) {
      return true; // Matched since operation not formed
    }
    return rowData[csvKey] === value;
  },
  notEquals: (rowData: any, csvKey: string, conditions: any[], value: any) => {
    let conditionsMatch = true;
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      if (!matchValue) {
        conditionsMatch = false;
        break;
      }
    }
    if (!conditionsMatch) {
      return true; // Matched since operation not formed
    }
    return rowData[csvKey] !== value;
  },
  lessThan: (rowData: any, csvKey: string, conditions: any[], value: any) => {
    const rowValue = !isNaN(rowData[csvKey])
      ? Number(rowData[csvKey])
      : rowData[csvKey];
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      return rowValue < matchValue;
    }
    return rowValue < value;
  },
  lessThanOrEqualTo: (
    rowData: any,
    csvKey: string,
    conditions: any[],
    value: any
  ) => {
    const rowValue = !isNaN(rowData[csvKey])
      ? Number(rowData[csvKey])
      : rowData[csvKey];
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      return rowValue <= matchValue;
    }
    return rowValue <= value;
  },
  greaterThan: (
    rowData: any,
    csvKey: string,
    conditions: any[],
    value: any
  ) => {
    const rowValue = !isNaN(rowData[csvKey])
      ? Number(rowData[csvKey])
      : rowData[csvKey];
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      return rowValue > matchValue;
    }
    return rowValue > value;
  },
  greaterThanOrEqualTo: (
    rowData: any,
    csvKey: string,
    conditions: any[],
    value: any
  ) => {
    const rowValue = !isNaN(rowData[csvKey])
      ? Number(rowData[csvKey])
      : rowData[csvKey];
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      return rowValue >= matchValue;
    }
    return rowValue >= value;
  },
  in: (rowData: any, csvKey: string, conditions: any[], value: any[]) => {
    let conditionsMatch = true;
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      if (!matchValue) {
        conditionsMatch = false;
        break;
      }
    }
    if (!conditionsMatch) {
      return true;
    }
    return value.includes(rowData[csvKey]);
  },
  notIn: (rowData: any, csvKey: string, conditions: any[], value: any[]) => {
    let conditionsMatch = true;
    for (const condition of conditions) {
      const matchValue = checkTypeMap[condition.checkType](rowData, condition);
      if (!matchValue) {
        conditionsMatch = false;
        break;
      }
    }
    if (!conditionsMatch) {
      return true;
    }
    return !value.includes(rowData[csvKey]);
  },
  subtract: (rowData: any, csvKey: string, conditions: any[]) => {
    let difference = Number(rowData[csvKey]);
    for (const condition of conditions) {
      const value = checkTypeMap[condition.checkType](rowData, condition);
      difference -= Number(value);
    }
    return difference;
  },
  subtractRangeIn: (
    rowData: any,
    csvKey: string,
    conditions: any[],
    value: any
  ) => {
    let difference = Number(rowData[csvKey]);
    for (const condition of conditions) {
      const value = checkTypeMap[condition.checkType](rowData, condition);
      difference -= Number(value);
    }
    return difference >= value[0] && difference <= value[1];
  },
  add: (rowData: any, csvKey: string, conditions: any[]) => {
    let sum = Number(rowData[csvKey]);
    for (const condition of conditions) {
      const value = checkTypeMap[condition.checkType](rowData, condition);
      sum += Number(value);
    }
    return sum;
  },
};

const checkTypeMap = {
  independent: (rowData: any, validation: any) => {
    if (!validation.checkName) {
      if (validation.checkField) {
        return rowData[validation.checkField];
      }
      return validation.value;
    }

    return operatorTypeMap[validation.checkName](
      rowData,
      validation.checkField,
      validation.conditions ?? [],
      validation.value
    );
    // operator work
  },
  dependent: (rowData: any, validation: any) => {
    // operator work
    return operatorTypeMap[validation.checkName](
      rowData,
      validation.checkField,
      validation.conditions ?? [],
      validation.value
    );
  },
};

@Service()
export class RowValidationService {
  public validateRow(row: any, validations: any[]) {
    const failedValidations = [];
    for (const validation of validations) {
      const validationPassed = checkTypeMap[validation.checkType](
        row,
        validation
      );
      if (!validationPassed) {
        failedValidations.push(validation.name);
      }
    }
    return failedValidations;
  }
}
