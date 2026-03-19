export interface RelationshipValidation {
	validate(value: any): RelationshipValidationResult | Promise<RelationshipValidationResult>;
}

export interface RelationshipValidationResult {
	isValid: boolean;
	message: string | undefined;
}