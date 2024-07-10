//* Lógica para centralizar os erros
function handleErro(res, mensagemErro, status = 500) {
  console.error(mensagemErro);
  res.status(status).json({ error: mensagemErro });
}

//* Lógica para converter data para o formato ISO 8601
function convertDateToISO(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}T21:18:00Z`).toISOString();
}

module.exports = { handleErro, convertDateToISO };