const { response } = require('express')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const sqlite = require('sqlite-sync')
dbConnection = sqlite.connect(path.resolve(__dirname,'banco.sqlite'));

const port = process.env.PORT || 3000

const path = require('path')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async(request, response) => {
    const db = await dbConnection
    const categoriasDb = await db.run('select * from categorias;')
    const vagas = await db.run('select * from vagas;')
    const categorias = categoriasDb.map(cat =>{
        return{
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })
    response.render('home', {
        categorias

    })
})

app.get('/vaga/:id', async(request, response) => {
    //console.log(request.params.id)
    const db = await dbConnection
    const vagaaux = await db.run('select * from vagas where id='+request.params.id)
    vaga = vagaaux[0]
    response.render('vaga', {
        vaga
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.run('select * from vagas;')
    res.render('admin/vagas', {
        vagas
    })
})

app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id)
    res.redirect('/admin/vagas')
})


app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.run('select * from categorias')
    res.render('admin/nova-vaga', {categorias})
})

app.post('/admin/vagas/nova', async(req, res) => {
    const{titulo, descricao, categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values (${categoria}, '${titulo}', '${descricao}');`)
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.run('select * from categorias')
    const vagaaux = await db.run('select * from vagas where id = '+req.params.id)
    const vaga = vagaaux[0]
    res.render('admin/editar-vaga', {categorias, vaga})
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    const{titulo, descricao, categoria} = req.body
    const id = req.params.id
    const db = await dbConnection
    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')
})

app.get('/admin/categorias', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.run('select * from categorias;')
    res.render('admin/categorias', {
        categorias
    })
})

app.get('/admin/categorias/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from categorias where id = '+req.params.id)
    res.redirect('/admin/categorias')
})


app.get('/admin/categorias/nova', async(req, res) => {
    res.render('admin/nova-categoria')
})

app.post('/admin/categorias/nova', async(req, res) => {
    const {categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into categorias(categoria) values ('${categoria}');`)
    res.redirect('/admin/categorias')
})

app.get('/admin/categorias/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categoriaaux = await db.run('select * from categorias where id = '+req.params.id)
    const categorias = categoriaaux[0]
    res.render('admin/editar-categoria', {categorias})
})

app.post('/admin/categorias/editar/:id', async(req, res) => {
    const {categoria} = req.body
    const id = req.params.id
    const db = await dbConnection
    await db.run(`update categorias set categoria = '${categoria}' where id = ${id}`)
    res.redirect('/admin/categorias')
})

const init = async() =>{ 
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //const categoria = 'Marketing team'
    //await db.run(`insert into categorias(categoria) values ('${categoria}');`)
    //const vaga = 'Social Media'
    //const descricao = 'Vaga para Social Media'
    //await db.run(`insert into vagas(categoria, titulo, descricao) values (2, '${vaga}', '${descricao}');`)
}
init()
app.listen(port, (err) => {
    if (err){
        console.log('Não foi possível iniciar o servidor jobify')
    }else{
        console.log('Servidor jobify rodando...')
    }
})