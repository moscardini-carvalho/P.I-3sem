import { Router } from 'express'
import controller from '../controllers/produtos.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', upload.array('imagens', 5), controller.create)
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.put('/:id', upload.array('imagens', 5), controller.update)
router.delete('/:id', controller.delete)

export default router