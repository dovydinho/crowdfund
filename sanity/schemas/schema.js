import createSchema from 'part:@sanity/base/schema-creator';
import schemaTypes from 'all:part:@sanity/base/schema-type';
import projects from './projectSchema';
import users from './userSchema';

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([projects, users])
});
