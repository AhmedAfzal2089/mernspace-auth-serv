import app from './app'
import { Config } from './config'
import logger from './config/logger'

const startServer = () => {
    const PORT = Config.PORT
    try {
        app.listen(PORT, () => {
            logger.info('Server Listening on port, ', { port: PORT })
            logger.info('Testing ....')
        })
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}
startServer()
