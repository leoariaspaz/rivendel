export interface RelationshipValidation {
  isRelated(value: number): RelationshipValidationResult | Promise<RelationshipValidationResult>;
}

export interface RelationshipValidationResult {
  hasRelations: boolean;
  message: string | undefined;
}
