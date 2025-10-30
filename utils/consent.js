export const renderConsent = (req, res,  {client, redirect_uri, state, code_challenge, scope }) => {
  const scopeArray = scope.split(' ')
  const scopeListHTML = scopeArray
    .map(s => `<li class="list-group-item">${s}</li>`)
    .join('')

  res.render('consent', {
    client_name: client.client_name,
    scope_list: scopeListHTML,
    client_id: client.client_id,
    redirect_uri,
    state,
    code_challenge,
    scope,
    user_id: req.session.user.id
  })
}