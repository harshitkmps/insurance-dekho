export class AttributeDto {
  key: string;
  value: string;
  isEncrypted: boolean;
}

export class UpdateAttributeRequestDto extends AttributeDto {
  action: "block" | "unblock";
}
