import { Schema } from 'effect'

const RoleList = Schema.Array(Schema.String)

/** Schema for .admin/roles.json */
export const RolesConfigSchema = Schema.Struct({
  roles: Schema.Struct({
    editor: RoleList,
    'chief-editor': RoleList,
    admin: RoleList,
  }),
})

/** Validated roles config type */
export type RolesConfig = typeof RolesConfigSchema.Type
