/**
 * Service class to handle common database queries.
 * @class CommentService
 */
class Service {
    constructor(model) {
      this.model = model;
    }
  
    getOne = (query) => {
      let fields = "";
      let populate = "";
      if (query.select) {
        fields = query.select;
        delete query.select;
      }
      if (query.populate) {
        populate = query.populate;
        delete query.populate;
      }
      const res = this.model.findOne(query);
      if (populate) {
        res.populate(populate);
      }
      if (fields) {
        const result = res.select(fields);
        return result;
      }
      return res;
    };
  
    updateOne = (query, update, options = {}) => {
        return this.model.findOneAndUpdate(query, update, options).exec();
    };
    
  }
  module.exports = Service;
  