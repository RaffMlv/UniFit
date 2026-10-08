import 'dotenv/config'
import app from './app.js'

app.listen(process.env.PORT, () => {
  console.log(`API rodando em http://localhost:${process.env.PORT}`)
})