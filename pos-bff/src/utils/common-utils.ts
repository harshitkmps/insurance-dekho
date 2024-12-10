import _ from "lodash";
import { createHash } from "crypto";

export default class CommonUtils {
  static buildName(..._list: string[]) {
    const name = _list.filter(Boolean).join(" ");
    return name;
  }

  static buildAddress(..._list: string[]) {
    const address = _list.filter(Boolean).join(", ");
    return address;
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

  static renameKey(obj, oldKey, newKey) {
    if (obj) {
      obj[newKey] = obj[oldKey];
      delete obj[oldKey];
    }
  }

  static capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  static capitalizeFirstLetterOfEachWord(sentence: string, separator: string) {
    const wordArr = sentence.split(separator);
    const capitalizedWordArr = wordArr.map(this.capitalizeFirstLetter);
    return capitalizedWordArr.join(separator);
  }

  static capitalizeFirstLetterOfEachWordJoinSeperator(
    sentence: string,
    separator: string,
    joinSeparator: string
  ) {
    const splitArr = _.split(sentence, separator);
    sentence = _.join(splitArr, joinSeparator);
    sentence = sentence.toLowerCase();
    return _.startCase(sentence);
  }

  static priceInLacsOrThousands(value: any) {
    if (value >= 100000) {
      return (value / 100000).toFixed(2) + " Lacs";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + " Thousands";
    } else {
      return value;
    }
  }

  static isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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

  static removeFalsyQueryParams(obj: any) {
    const updatedObject = {};
    for (const key in obj) {
      if (!this.isEmpty(obj[key])) {
        updatedObject[key] = obj[key];
      }
    }
    return updatedObject;
  }
  static roundOffNumber = (value, roundOffFigure = 100) => {
    return Math.round(value * roundOffFigure) / roundOffFigure;
  };
  static createHash(seed: string, algo = "sha256") {
    return createHash(algo).update(seed).digest("hex");
  }
  static calculatePercentageChange = (num1, num2) => {
    if (num1 == 0) return num2 != 0 ? -100 : 0;
    return Math.round(((num1 - num2) / num2) * 100);
  };
  static valueToFigure = (
    value: number,
    roundOffFigure = 10,
    extended = false
  ) => {
    if (value >= 10000000) {
      return (
        Math.round((value / 10000000) * roundOffFigure) / roundOffFigure +
        (extended ? " Crore" : " Cr")
      );
    }
    if (value >= 100000) {
      return (
        Math.round((value / 100000) * roundOffFigure) / roundOffFigure +
        (extended ? " Lakh" : " L")
      );
    }
    if (value >= 1000) {
      return (
        Math.round((value / 1000) * roundOffFigure) / roundOffFigure + " K"
      );
    }
    return value;
  };
  static calculatePercentageCovered = (num1: number, num2: number) => {
    if (!num2 || !num1) return 0;
    return Math.round((num1 / num2) * 100);
  };

  static isImage(url: string): boolean {
    return /(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  static decodeJWTFromReq(authorization: string) {
    const token = authorization.split(" ")[1];
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const buff = Buffer.from(base64, "base64");
    const payloadinit = buff.toString("ascii");
    return JSON.parse(payloadinit);
  }

  static convertCamelCaseToStr(
    str: string,
    capitalizeEachWord: boolean,
    separator = " "
  ): string {
    const wordArr: string[] = str.split("_");
    if (capitalizeEachWord) {
      const capitalizedWordArr = wordArr.map(this.capitalizeFirstLetter);
      return capitalizedWordArr.join(separator);
    }
    return wordArr.join(" ");
  }

  static snakeToCamel(str: string): string {
    return str
      .toLowerCase()
      .replaceAll(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replaceAll("_", "")
      );
  }

  static kebabToCamel(str: string): string {
    return str
      .toLowerCase()
      .replaceAll(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replaceAll("-", "")
      );
  }
}
