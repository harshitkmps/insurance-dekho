import { CHATBOT_POLICY_PRODUCT } from "@/src/constants/config.constants";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export class ChatbotPolicyDocRequestDto {
  @IsEnum(CHATBOT_POLICY_PRODUCT)
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  policyNumber: string;
}

export class RenewalChatbotPolicyDocRequestDto {
  @IsOptional()
  product: string;

  @IsOptional()
  policyNumber: string;

  @IsOptional()
  registrationNumber: string;

  queryType: string;
}
