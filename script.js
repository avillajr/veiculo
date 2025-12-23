// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const closeMenuBtn = document.querySelector('.close-menu');
const mobileMenu = document.querySelector('.mobile-menu');
const menuLinks = document.querySelectorAll('.mobile-menu a');

function toggleMenu() {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

mobileMenuBtn.addEventListener('click', toggleMenu);
closeMenuBtn.addEventListener('click', toggleMenu);

menuLinks.forEach(link => {
    link.addEventListener('click', toggleMenu);
});

// Multi-step Form Logic
let currentStep = 1;

function updateProgress(step) {
    const steps = document.querySelectorAll('.progress-bar .step');
    steps.forEach(s => {
        const sNum = parseInt(s.getAttribute('data-step'));
        if (sNum <= step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });

    const lines = document.querySelectorAll('.progress-bar .line');
    // Simple logic for lines: if we are at step 2, first line is active
    // If we are at step 3, both lines active.
    // CSS-wise, we might want to target them specifically or just rely on the step circles.
    // For now, let's keep it simple with just the circles highlighting.
}

function showStep(step) {
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach(s => {
        s.classList.remove('active');
    });

    const targetStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
        currentStep = step;
        updateProgress(step);
    }
}

function nextStep(stepFrom) {
    // Validate current step
    if (stepFrom === 1) {
        const cep = document.getElementById('cep').value;
        if (cep.length < 5) {
            alert('Por favor, digite um CEP válido.');
            return;
        }
    }

    showStep(stepFrom + 1);
}

function prevStep(stepFrom) {
    showStep(stepFrom - 1);
}

// Form Submission (WhatsApp Redirect)
const form = document.getElementById('quoteForm');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const cep = document.getElementById('cep').value;
    const usage = document.querySelector('input[name="usage"]:checked').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const model = document.getElementById('model').value;
    const year = document.getElementById('year').value;
    const phone = document.getElementById('phone').value;

    // Format message
    const message = `Olá! Gostaria de uma cotação.\n\nCEP: ${cep}\nUso: ${usage}\nNome: ${name}\nEmail: ${email}\nVeículo: ${model}\nAno: ${year}\nTel: ${phone}`;

    // Encode for URL
    const encodedMessage = encodeURIComponent(message);

    // Send Email via FormSubmit.co (Background)
    const emailData = {
        _subject: "Nova Cotação Solicitada - CL&C",
        _captcha: "false",
        _template: "table",
        Nome: name,
        Email: email,
        Telefone: phone,
        Veiculo: model,
        Ano: year,
        CEP: cep,
        Uso: usage
    };

    fetch("https://formsubmit.co/ajax/clccorretoradeseguros@gmail.com", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(emailData)
    })
        .then(response => console.log("Email status:", response))
        .catch(error => console.error("Email failed:", error));

    // Redirect to WhatsApp
    window.open(`https://wa.me/5521972802652?text=${encodedMessage}`, '_blank');
});

// Input Masks (Simple)
const cepInput = document.getElementById('cep');
cepInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    e.target.value = value;
});

const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    // (11) 99999-9999 format
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 2) {
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 10) {
        value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }
    e.target.value = value;
});

// Initialize
updateProgress(1);
