// triage.js — Triage Wizard

let currentStep = 1;
const totalSteps = 4;

// Get form elements
const nextBtn = document.querySelector('.btn-next');
const backBtn = document.querySelector('.btn-back');
const progressFill = document.querySelector('.progress-fill');

// Wizard steps data
const wizardSteps = [
  {
    title: "What type of service do you need?",
    description: "Select the service category that best matches your needs.",
    question: "Select a service:",
    options: [
      { id: "service-id", text: "Identity Document Application" },
      { id: "service-passport", text: "Passport Services" },
      { id: "service-license", text: "Driver's License" },
      { id: "service-renewal", text: "Document Renewal" }
    ]
  },
  {
    title: "What documents do you have?",
    description: "Tell us which documents you already have ready.",
    question: "Select documents:",
    options: [
      { id: "doc-birth", text: "Birth Certificate" },
      { id: "doc-id", text: "Current ID/Passport" },
      { id: "doc-proof", text: "Proof of Address" }
    ]
  },
  {
    title: "When would you like your appointment?",
    description: "Choose a time slot that works best for you.",
    question: "Preferred time:",
    options: [
      { id: "time-morning", text: "Morning (08:00 - 12:00)" },
      { id: "time-afternoon", text: "Afternoon (12:00 - 16:00)" },
      { id: "time-evening", text: "Evening (16:00 - 20:00)" }
    ]
  },
  {
    title: "Review your selections",
    description: "Please review your selections before proceeding to booking.",
    question: "Is everything correct?",
    options: [
      { id: "confirm-yes", text: "Yes, proceed to booking" },
      { id: "confirm-no", text: "No, let me go back" }
    ]
  }
];

function updateProgressBar() {
  const progress = (currentStep / totalSteps) * 100;
  progressFill.style.width = progress + '%';
}

function goToNextStep() {
  const selectedOption = document.querySelector('input[name="wizardOption"]:checked');
  
  if (!selectedOption) {
    alert("Please select an option to continue.");
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;
    renderStep();
    updateProgressBar();
  } else {
    // Final step - proceed to booking
    alert("Proceeding to booking confirmation...");
    window.location.href = 'booking.html';
  }
}

function goToBackStep() {
  if (currentStep > 1) {
    currentStep--;
    renderStep();
    updateProgressBar();
  }
}

function renderStep() {
  const step = wizardSteps[currentStep - 1];
  const wizardContainer = document.querySelector('.wizard-container');
  
  let optionsHTML = '';
  step.options.forEach(option => {
    optionsHTML += `
      <div class="option-item">
        <input type="radio" id="${option.id}" name="wizardOption" value="${option.id}" />
        <label for="${option.id}">${option.text}</label>
      </div>
    `;
  });

  const backBtnHTML = currentStep > 1 ? `<button type="button" class="btn-wizard btn-back">← Back</button>` : '';
  const nextBtnText = currentStep === totalSteps ? 'Complete Wizard →' : 'Next Step →';

  wizardContainer.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${(currentStep / totalSteps) * 100}%;"></div>
    </div>

    <div class="wizard-step">
      <div class="step-number">${currentStep}</div>
      <h2 class="step-title">${step.title}</h2>
      <p class="step-description">${step.description}</p>

      <div class="question-group">
        <label class="question-label">${step.question}</label>
        <div class="question-options">
          ${optionsHTML}
        </div>
      </div>
    </div>

    <div class="wizard-buttons">
      ${backBtnHTML}
      <button type="button" class="btn-wizard btn-next">${nextBtnText}</button>
    </div>
  `;

  // Re-attach event listeners
  document.querySelector('.btn-next').addEventListener('click', goToNextStep);
  
  const backBtn = document.querySelector('.btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', goToBackStep);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateProgressBar();
  nextBtn.addEventListener('click', goToNextStep);
  
  if (backBtn) {
    backBtn.addEventListener('click', goToBackStep);
  }
});
