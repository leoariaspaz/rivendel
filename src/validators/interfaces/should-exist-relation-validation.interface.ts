export interface ShouldExistRelationValidation {
	exists(value: any): ValidateRelationResult | Promise<ValidateRelationResult>;
}

export interface ValidateRelationResult {
	isValid: boolean;
	message: string | undefined;
}