const DynamicTableService = require('../services/dynamicTableService');

const dynamicController = {
  async createTable(req, res, next) {
    try {
      const { tableName, columns } = req.body;
      if (!tableName || !columns) {
        return res.status(400).json({ error: 'tableName and columns required' });
      }
      const result = await DynamicTableService.createTable(tableName, columns);
      res.status(201).json({ message: 'Table created', ...result });
    } catch (err) {
      next(err);
    }
  },

  async insertRow(req, res, next) {
    try {
      const row = await DynamicTableService.insertRow(req.params.table, req.body);
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      const rows = await DynamicTableService.findAll(req.params.table, limit, offset);
      const total = await DynamicTableService.countRows(req.params.table);
      res.json({ rows, total });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const row = await DynamicTableService.findById(req.params.table, req.params.id);
      if (!row) return res.status(404).json({ error: 'Row not found' });
      res.json(row);
    } catch (err) {
      next(err);
    }
  },

  async updateRow(req, res, next) {
    try {
      const row = await DynamicTableService.updateRow(req.params.table, req.params.id, req.body);
      if (!row) return res.status(404).json({ error: 'Row not found' });
      res.json(row);
    } catch (err) {
      next(err);
    }
  },

  async deleteRow(req, res, next) {
    try {
      const row = await DynamicTableService.deleteRow(req.params.table, req.params.id);
      if (!row) return res.status(404).json({ error: 'Row not found' });
      res.json({ message: 'Row deleted' });
    } catch (err) {
      next(err);
    }
  },

  async dropTable(req, res, next) {
    try {
      const result = await DynamicTableService.dropTable(req.params.table);
      res.json({ message: 'Table dropped', ...result });
    } catch (err) {
      next(err);
    }
  },

  async listTables(req, res, next) {
    try {
      const tables = await DynamicTableService.listTables();
      res.json(tables);
    } catch (err) {
      next(err);
    }
  },

  async getTableInfo(req, res, next) {
    try {
      const info = await DynamicTableService.getTableInfo(req.params.table);
      res.json(info);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dynamicController;
