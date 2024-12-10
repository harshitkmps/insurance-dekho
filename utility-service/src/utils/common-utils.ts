import _ from "lodash";
import fs from "fs";
import { createHash } from "crypto";
export default class CommonUtils {
  static buildName(..._list: string[]) {
    const name = _list.filter(Boolean).join(" ");
    return name;
  }

  /**
   * @method isEmpty
   * @param {String | Number | Object} value
   * @returns {Boolean} true & false
   * @description this value is Empty Check
   */
  static isEmpty(value: string | number | object): boolean {
    if (value === null) {
      return true;
    } else if (typeof value !== "number" && value === "") {
      return true;
    } else if (typeof value === "undefined" || value === undefined) {
      return true;
    } else if (
      value !== null &&
      typeof value === "object" &&
      !Object.keys(value).length
    ) {
      return true;
    } else {
      return false;
    }
  }

  static capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  static capitalizeFirstLetterOfEachWord(sentence: string, separator: string) {
    const wordArr = sentence.split(separator);
    const capitalizedWordArr = wordArr.map(this.capitalizeFirstLetter);
    return capitalizedWordArr.join(separator);
  }

  static delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static isObject(value: any) {
    if (value && _.isObject(value) && !_.isArray(value)) {
      return true;
    }
    return false;
  }

  static async unSyncFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  static convertToCSV(arr: any[], csvHeadingsMapping: any) {
    const objKeys: string[] = Object.values(csvHeadingsMapping);
    const array = arr?.length
      ? arr.map((obj) =>
          objKeys.map((key) => {
            let cleanedValue = "";
            if (obj[key] || obj[key] === 0) {
              if (typeof obj[key] === "object") {
                cleanedValue = `"${JSON.stringify(obj[key]).replace(
                  /"/g,
                  "'"
                )}"`;
              } else if (isNaN(obj[key])) {
                // for not a number
                cleanedValue = `"${obj[key].replace(/"/g, "'")}"`;
              } else {
                cleanedValue = `"=""${obj[key]}"""`;
              }
            }
            return cleanedValue;
          })
        )
      : [];
    return array
      .map((it) => {
        return Object.values(it).toString();
      })
      .join("\n");
  }

  static isJsonString(err: any) {
    try {
      const error = JSON.parse(JSON.stringify(err));
      if (!Object.keys(error).length) {
        return err.stack;
      }
      return JSON.parse(err);
    } catch (e) {
      return err;
    }
  }

  static isJsonStringV2(string: any): boolean {
    try {
      JSON.parse(string);
      return true;
    } catch (e) {
      return false;
    }
  }

  static sha256(content: string): string {
    return createHash("sha256").update(content).digest("hex").toString();
  }

  static splitArrayIntoChunks(arr: any[], chunkSize: number): any[][] {
    const chunkedArr = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      chunkedArr.push(chunk);
    }
    return chunkedArr;
  }

  static convertCamelToTitleCase(text: string): string {
    const result = text.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  }
}
