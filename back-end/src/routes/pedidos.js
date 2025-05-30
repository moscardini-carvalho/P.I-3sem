import { Router } from 'express'
import controller from '../controllers/pedidos.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', controller.create)
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

// Rotas para os itens do pedido
router.post('/:id/itens', controller.createItem)
router.get('/:id/itens', controller.retrieveAllItems)
router.get('/:id/itens/:itemId', controller.retrieveOneItem)
router.put('/:id/itens/:itemId', controller.updateItem)
router.delete('/:id/itens/:itemId', controller.deleteItem)

// Rotas para as fotos do pedido
router.post('/:id/fotos', upload.single('foto'), controller.uploadFotoPedido)
router.get('/:id/fotos', controller.getFotosPedido)
router.get('/fotos/:fotoId', controller.getFotoPedidoById)
router.delete('/fotos/:fotoId', controller.deleteFotoPedido)

export default router