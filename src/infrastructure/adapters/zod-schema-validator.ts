export class ZodSchemaValidator {
  parse<SchemaOutput>(
    schema: { parse(input: unknown): SchemaOutput },
    data: unknown
  ): SchemaOutput {
    return schema.parse(data);
  }
}
