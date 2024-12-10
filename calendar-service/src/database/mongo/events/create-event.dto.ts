export class CreateEventDto {
  type: string;
  start_time: number;
  end_time: number;
  meta_data: any;
  participants: any;
  context?: any;
  status?: any;
  created_at?: Date;
  updated_at?: Date;
}
