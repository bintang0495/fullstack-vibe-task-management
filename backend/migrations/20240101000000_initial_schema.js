/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('master_tasks', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('description').nullable();
      table.time('time').notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('master_task_days', table => {
      table.increments('id').primary();
      table.integer('master_task_id').unsigned().references('id').inTable('master_tasks').onDelete('CASCADE');
      table.specificType('day_of_week', 'smallint').notNullable(); // 0=Sunday... 6=Saturday
    })
    .createTable('custom_tasks', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('description').nullable();
      table.time('time').notNullable();
      table.date('task_date').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('task_logs', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.enu('task_type', ['master', 'custom']).notNullable();
      table.integer('task_id').unsigned().notNullable(); // No direct FK because it's polymorphic
      table.date('task_date').notNullable();
      table.enu('status', ['done', 'not_done']).defaultTo('not_done');
      table.timestamp('completed_at').nullable();
      
      // Constraint: satu task hanya punya satu log per tanggal per user
      table.unique(['user_id', 'task_type', 'task_id', 'task_date']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('task_logs')
    .dropTableIfExists('custom_tasks')
    .dropTableIfExists('master_task_days')
    .dropTableIfExists('master_tasks')
    .dropTableIfExists('users');
};
