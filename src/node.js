import jsonGraphqlExpress from './jsonGraphqlExpress';
import schemaBuilder, { getPlainSchema as plainSchema } from './schemaBuilder';

export const jsonSchemaBuilder = schemaBuilder;
export const getPlainSchema = plainSchema;
export default jsonGraphqlExpress;
