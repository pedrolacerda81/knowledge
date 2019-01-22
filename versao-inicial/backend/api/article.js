module.exports = app => {
    const { existisOrError, notExistsOrError, equalsOrError } = app.api.validation

    const save = (req, resp) => {
        const article = {...req.body }
        if(req.params.id) article.id = req.params.id

        try {
            existisOrError(article.name, 'Nome não informado.')
            existisOrError(article.description, 'Descrição não informada.')
            existisOrError(article.categoryId, 'Categoria não informada.')
            existisOrError(article.userId, 'Autor não informado.')
            existisOrError(article.content, 'Conteúdo não informado.')
        } catch(msg) {
            resp.status(400).send(msg)
        }

        if(article.id) {
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(_ => resp.status(204).send())
                .catch(erro => resp.status(500).send(erro))
        } else {
            app.db('articles')
                .insert(article)
                .then(_ => resp.status(204).send())
                .catch(erro => resp.status(500).send(erro))
        }
    }

    const remove = async (req, resp) => {
        try {
            const rowsDeleted = await app.db('articles')
                .where({id: req.params.id}).del()
            notExistsOrError(rowsDeleted, 'Artigo não encontrado.')
            resp.status(204).send()
        } catch(msg) {
            resp.status(500).send(msg)
        }
    }

    const limit = 10
    const get =  async (req, resp) => {
        const page = req.query.page || 1

        const result = await app.db('articles').count('id').first()
        const count = parseInt(result.count)

        app.db('articles')
            .select('id', 'nome', 'description')
    }
}