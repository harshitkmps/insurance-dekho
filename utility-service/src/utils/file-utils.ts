export default class FileUtils {
  static getFileExtensionFromLink(link: string): string {
    const splitFileLink = link?.split(".");
    return splitFileLink[splitFileLink.length - 1];
  }
}
