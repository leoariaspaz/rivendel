export interface RelationshipValidation {
	isRelated(value: any): RelationshipValidationResult | Promise<RelationshipValidationResult>;
}

export interface RelationshipValidationResult {
	hasRelations: boolean;
	message: string | undefined;
}