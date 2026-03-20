exports.up = function(knex) {
  return knex.schema.createTable('leads', function(table) {
    table.increments('id').primary();
    table.string('fullname').notNullable();
    table.string('phone').notNullable();
    table.string('email').nullable();
    table.integer('course_id').unsigned().nullable();
    table.text('message').nullable();
    table.string('status').defaultTo('new'); 
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('leads');
};
