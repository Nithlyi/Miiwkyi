const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot está vivo!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor web rodando na porta ${PORT}`);
});
