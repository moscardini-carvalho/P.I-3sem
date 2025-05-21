import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

app.use('/', indexRouter)
app.use('/users', usersRouter)

/***************** ROTAS ***********************/

import categoriasRouter from './routes/categorias.js'
app.use('/categorias', categoriasRouter)

import clientesRouter from './routes/clientes.js'
app.use('/clientes', clientesRouter)

import fornecedoresRouter from './routes/fornecedores.js'
app.use('/fornecedores', fornecedoresRouter)

import pedidosRouter from './routes/pedidos.js'
app.use('/pedidos', pedidosRouter)

import produtosRouter from './routes/produtos.js'
app.use('/produtos', produtosRouter)

// Configuração para servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

export default app
