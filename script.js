(function(){
  var $ = function(id){ return document.getElementById(id); };
  var form = $('form'), email = $('email'), pass = $('pass'), remember = $('remember');
  var alertBox = $('alert'), submit = $('submit'), btnText = $('btnText');
  var DEMO = { email: 'demo@exemplo.com', pass: 'senha123' };
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var tries = 0, lockedUntil = 0;

  // Lembrar e-mail (apenas conveniência local)
  try {
    var saved = localStorage.getItem('login:email');
    if (saved) { email.value = saved; remember.checked = true; }
  } catch (e) {}

  function setError(field, msg){
    $('f-' + field).classList.toggle('invalid', !!msg);
    $('e-' + field).textContent = msg || '';
  }
  function showAlert(type, msg){
    alertBox.className = 'alert show ' + type;
    alertBox.textContent = msg;
  }
  function clearAlert(){ alertBox.className = 'alert'; alertBox.textContent = ''; }

  function validate(){
    var ok = true;
    var v = email.value.trim();
    if (!v) { setError('email', 'Digite seu e-mail.'); ok = false; }
    else if (!emailRe.test(v)) { setError('email', 'Digite um e-mail válido, como voce@exemplo.com.'); ok = false; }
    else setError('email');

    if (!pass.value) { setError('pass', 'Digite sua senha.'); ok = false; }
    else if (pass.value.length < 6) { setError('pass', 'A senha tem pelo menos 6 caracteres.'); ok = false; }
    else setError('pass');
    return ok;
  }

  email.addEventListener('input', function(){ if ($('f-email').classList.contains('invalid')) validate(); });
  pass.addEventListener('input', function(){ if ($('f-pass').classList.contains('invalid')) validate(); });

  $('toggle').addEventListener('click', function(){
    var show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    this.textContent = show ? 'Ocultar' : 'Mostrar';
    this.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
  });

  // Simula uma chamada ao servidor. Troque por fetch('/api/login', ...) no seu backend.
  function fakeLogin(e, p){
    return new Promise(function(resolve){
      setTimeout(function(){
        resolve(e.toLowerCase() === DEMO.email && p === DEMO.pass);
      }, 900);
    });
  }

  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    clearAlert();

    var now = Date.now();
    if (now < lockedUntil) {
      showAlert('error', 'Muitas tentativas. Aguarde ' + Math.ceil((lockedUntil - now) / 1000) + ' segundos.');
      return;
    }
    if (!validate()) return;

    submit.disabled = true; submit.classList.add('loading'); btnText.textContent = 'Entrando...';

    fakeLogin(email.value.trim(), pass.value).then(function(ok){
      submit.disabled = false; submit.classList.remove('loading'); btnText.textContent = 'Entrar';
      if (ok) {
        tries = 0;
        try {
          if (remember.checked) localStorage.setItem('login:email', email.value.trim());
          else localStorage.removeItem('login:email');
        } catch (e) {}
        $('welcomeMsg').textContent = 'Você entrou como ' + email.value.trim() + '.';
        $('loginView').style.display = 'none';
        $('welcome').classList.add('show');
      } else {
        tries++;
        if (tries >= 5) {
          lockedUntil = Date.now() + 30000; tries = 0;
          showAlert('error', 'Muitas tentativas. Aguarde 30 segundos e tente de novo.');
        } else {
          showAlert('error', 'E-mail ou senha incorretos. Confira os dados e tente de novo.');
        }
        pass.value = ''; pass.focus();
      }
    });
  });

  $('logout').addEventListener('click', function(){
    $('welcome').classList.remove('show');
    $('loginView').style.display = '';
    pass.value = ''; clearAlert();
    (email.value ? pass : email).focus();
  });

  $('forgot').addEventListener('click', function(e){
    e.preventDefault();
    var v = email.value.trim();
    if (!emailRe.test(v)) { setError('email', 'Digite seu e-mail para receber o link de redefinição.'); email.focus(); return; }
    setError('email');
    showAlert('ok', 'Se houver uma conta com ' + v + ', enviaremos um link para redefinir a senha.');
  });
  $('signup').addEventListener('click', function(e){
    e.preventDefault();
    showAlert('ok', 'Aqui você pode ligar a tela de cadastro da sua aplicação.');
  });

  // Tema
  var themeBtn = $('theme'), root = document.documentElement;
  function isDark(){
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function label(){ themeBtn.textContent = isDark() ? 'Tema claro' : 'Tema escuro'; }
  themeBtn.addEventListener('click', function(){
    root.setAttribute('data-theme', isDark() ? 'light' : 'dark'); label();
  });
  label();
})();
