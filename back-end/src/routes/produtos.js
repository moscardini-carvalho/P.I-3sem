import { Router } from 'express'
import controller from '../controllers/produtos.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', upload.array('imagens', 5), controller.create)
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.put('/:id', upload.array('imagens', 5), controller.update)
router.delete('/:id', controller.delete)

// Nova rota para listar imagens de um produto
router.get('/:id/imagens', controller.getImagensByProduto);

// Nova rota para servir uma imagem pelo seu ID
router.get('/imagens-produto/:id', controller.getImagem);

export default router