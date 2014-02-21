module.exports = function (app, root, id, middleware, resource) {
    app.get(root, middleware, resource.index);
    app.post(root, middleware, resource.create);
    app.get(root + '/:' + id, middleware, resource.show);
    app.put(root + '/:' + id, middleware, resource.update);
    app.delete(root + '/:' + id, middleware, resource.destroy);
};
