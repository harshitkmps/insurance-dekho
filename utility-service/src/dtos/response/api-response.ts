export class ApiResponse {
  constructor(status: number, message: string, data: any) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
  private status: number;
  private message: string;
  private data: any;
}
