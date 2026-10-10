export interface ShouldExistRelationValidation {
  exists(value: number): ValidateRelationResult | Promise<ValidateRelationResult>;
}

export interface ValidateRelationResult {
  isValid: boolean;
  message: string | undefined;
}
