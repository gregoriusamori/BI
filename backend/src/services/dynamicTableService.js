const pool = require('../config/database');

const DynamicTableService = {
  async createTable(tableName, columns) {
    const colDefs = columns.map(c => `"${c.name}" ${c.type}`).join(', ');
    await pool.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (id SERIAL PRIMARY KEY, ${colDefs}, created_at TIMESTAMP DEFAULT NOW())`);
    return { table: tableName, columns };
  },

  async insertRow(tableName, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(
      `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async findAll(tableName, limit = 100, offset = 0) {
    const result = await pool.query(`SELECT * FROM "${tableName}" ORDER BY id LIMIT $1 OFFSET $2`, [limit, offset]);
    return result.rows;
  },

  async findById(tableName, id) {
    const result = await pool.query(`SELECT * FROM "${tableName}" WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async updateRow(tableName, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE "${tableName}" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async deleteRow(tableName, id) {
    const result = await pool.query(`DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  },

  async dropTable(tableName) {
    await pool.query(`DROP TABLE IF EXISTS "${tableName}"`);
    return { dropped: tableName };
  },

  async listTables() {
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
    );
    return result.rows.map(r => r.table_name);
  },

  async getTableInfo(tableName) {
    const result = await pool.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [tableName]
    );
    return result.rows;
  },

  async countRows(tableName) {
    const result = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
    return parseInt(result.rows[0].count);
  },
};

module.exports = DynamicTableService;
