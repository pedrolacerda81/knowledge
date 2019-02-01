const queries = require('./queries')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const article = { ...req.body }
        if (req.params.id) article.id = req.params.id

        try {
            existsOrError(article.name, 'Nome não informado.')
            existsOrError(article.description, 'Descrição não informada.')
            existsOrError(article.categoryId, 'Categoria não informada.')
            existsOrError(article.userId, 'Autor não informado.')
            existsOrError(article.content, 'Conteúdo não informado.')
        } catch (msg) {
            res.status(400).send(msg)
        }

        if (article.id) {
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('articles')
                .insert(article)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, resp) => {
        try {
            const rowsDeleted = await app.db('articles')
                .where({ id: req.params.id }).del()

            try {
                existsOrError(rowsDeleted, 'Artigo não encontrado.')
            } catch (msg) {
                return resp.status(400).send(msg)
            }

            resp.status(204).send()
        } catch (msg) {
            resp.status(500).send(msg)
        }
    }

    const limit = 10
    const get = async (req, resp) => {
        const page = req.query.page || 1

        const result = await app.db('articles').count('id').first()
        const count = parseInt(result.count)

        app.db('articles')
            .select('id', 'name', 'description')
            .limit(limit).offset(page * limit - limit)
            .then(articles => resp.json({ data: articles, count, limit }))
            .catch(erro => resp.status(500).send(erro))
    }

    const getById = (req, resp) => {
        app.db('articles')
            .where({ id: req.params.id })
            .first()
            .then(article => {
                article.content = article.content.toString()
                return resp.json(article)
            })
            .catch(erro => resp.status(500).send(erro))
    }

    const getByCategory = async (req, resp) => {
        const categoryId = req.params.id
        const page = req.query.page || 1
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId)
        const id = categories.rows.map(c => c.id)

        app.db()
    }

    return { save, remove, get, getById }
}