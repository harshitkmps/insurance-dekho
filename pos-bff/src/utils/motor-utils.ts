export default class MotorUtils {
  static isValidRegNumber(str: string) {
    if (!str) {
      return false;
    }
    const regexp = new RegExp(
      /^[A-Za-z]{2}[0-9]{1,2}[A-Za-z0-9]{0,1}[A-Za-z]{0,3}[0-9]{4}$/
    );
    const isValid = regexp.test(str);
    return isValid;
  }
}
