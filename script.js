const form = document.getElementById('contact-form');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if(name === '' || email === '' || message === '') {
    alert('Preencha todos os campos!');
    return;
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!emailValid.test(email)) {
    alert('Digite um email válido!');
    return;
  }

  alert('Mensagem enviada com sucesso!');

  form.reset();
});