import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('is_diet').notNullable()
    table.uuid('user_id').notNullable()
    table.datetime('date').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()

    table.foreign('user_id').references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
