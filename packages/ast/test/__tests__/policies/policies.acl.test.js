import { getConnections } from '../../utils';

let db, teardown;
const objs = {
  tables: {}
};

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  await db.begin();
  await db.savepoint();
});
afterAll(async () => {
  try {
    //try catch here allows us to see the sql parsing issues!
    await db.rollback();
    await db.commit();
    await teardown();
  } catch (e) {}
});

const getPolicyResult = async (name, vars) => {
  const [{ deparse }] = await db.any(
    `
  SELECT deparser.deparse(
    ast_helpers.create_policy_template(
      $1::text,
      $2::jsonb
    ))`,
    [name, JSON.stringify(vars)]
  );

  return deparse;
};

it('acl', async () => {
  const result = await getPolicyResult('acl', {
    acl_schema: 'acl_schema',
    acl_table: 'acl_table'
  });
  expect(result).toMatchSnapshot();
});

it('acl mask', async () => {
  const result = await getPolicyResult('acl', {
    acl_schema: 'acl_schema',
    acl_table: 'acl_table',
    mask: '1010101111'
  });
  expect(result).toMatchSnapshot();
});

it('entity_acl', async () => {
  const result = await getPolicyResult('entity_acl', {
    entity_field: 'owner_id',
    acl_schema: 'acl_schema',
    acl_table: 'acl_table'
  });
  expect(result).toMatchSnapshot();
});

it('entity_acl include user', async () => {
  const result = await getPolicyResult('entity_acl', {
    include_current_user_id: true,
    entity_field: 'owner_id',
    acl_schema: 'acl_schema',
    acl_table: 'acl_table'
  });
  expect(result).toMatchSnapshot();
});

it('entity_acl_mask', async () => {
  const result = await getPolicyResult('entity_acl', {
    entity_field: 'owner_id',
    acl_schema: 'acl_schema',
    acl_table: 'acl_table',
    mask: '1010010100101010111111'
  });
  expect(result).toMatchSnapshot();
});

it('entity_acl_mask include user', async () => {
  const result = await getPolicyResult('entity_acl', {
    include_current_user_id: true,
    entity_field: 'owner_id',
    acl_schema: 'acl_schema',
    acl_table: 'acl_table',
    mask: '1010010100101010111111'
  });
  expect(result).toMatchSnapshot();
});

it('entity_acl_join', async () => {
  const result = await getPolicyResult('entity_acl_join', {
    entity_field: 'owner_id',
    acl_schema: 'acl_schema',
    acl_table: 'acl_table',
    obj_schema: 'obj_schema',
    obj_table: 'obj_table',
    obj_field: 'group_id'
  });
  expect(result).toMatchSnapshot();
});

it('entity_acl_join include user', async () => {
  const result = await getPolicyResult('entity_acl_join', {
    include_current_user_id: true,
    entity_field: 'owner_id',
    acl_schema: 'acl_schema',
    acl_table: 'acl_table',
    obj_schema: 'obj_schema',
    obj_table: 'obj_table',
    obj_field: 'group_id'
  });
  expect(result).toMatchSnapshot();
});

it('entity_acl_join_mask', async () => {
  const result = await getPolicyResult('entity_acl_join', {
    entity_field: 'owner_id',
    acl_schema: 'acl_schema',
    acl_table: 'acl_table',
    obj_schema: 'obj_schema',
    obj_table: 'obj_table',
    obj_field: 'group_id',
    mask: '1010010100101010111111'
  });
  expect(result).toMatchSnapshot();
});

it('owned_object_records', async () => {
  const result = await getPolicyResult('owned_object_records', {
    owned_table_key: 'owned_table_key',
    owned_schema: 'owned_schema',
    owned_table: 'owned_table',
    owned_table_ref_key: 'owned_table_ref_key',
    this_object_key: 'this_object_key',
    rls_groups_schema: 'rls_schema',
    rls_groups: 'group_fn',
    rls_role_schema: 'rls_schema',
    rls_role: 'role_fn'
  });
  expect(result).toMatchSnapshot();
});

it('owned_object_records_group_array', async () => {
  const result = await getPolicyResult('owned_object_records_group_array', {
    owned_table_key: 'owned_table_key',
    owned_schema: 'owned_schema',
    owned_table: 'owned_table',
    owned_table_ref_key: 'owned_table_ref_key',
    this_object_key: 'this_object_key',
    rls_groups_schema: 'rls_schema',
    rls_groups: 'group_fn',
    rls_role_schema: 'rls_schema',
    rls_role: 'role_fn'
  });
  expect(result).toMatchSnapshot();
});
