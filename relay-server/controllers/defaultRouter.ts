import { Router } from 'express'

const router = Router()

router.get('/servers', async (req, res) => {
    const servers = ['localhost:8000']
    return res.json(servers)
})

export default router;