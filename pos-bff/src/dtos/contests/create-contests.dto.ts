import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsObject, IsOptional, IsString } from "class-validator";

export class CreateContestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiProperty()
  @IsString()
  endDate: string;

  @ApiProperty()
  @IsString()
  rewardDisbursementDate: string;

  @ApiProperty()
  @IsArray()
  eventVsProduct: Record<string, any>[];

  @ApiProperty()
  @IsString()
  milestoneLogicalOperator: string;

  @ApiProperty()
  @IsArray()
  milestonesValues: Record<string, any>[];

  @ApiProperty()
  @IsObject()
  milestoneVsRewards: Record<string, any>;

  @ApiProperty()
  @IsObject()
  participantEligbility: Record<string, any>;

  @ApiProperty()
  @IsArray()
  eligibleSalesHeads: Record<string, any>[];

  @ApiProperty()
  @IsObject()
  designation: any;

  @ApiProperty()
  @IsArray()
  weightages: Record<string, any>[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  participantsFileDocId?: string;
}
