const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const translations = {
  // Validation Messages
  "'First name required'": "'El primer nombre es requerido'",
  "'Last name required'": "'El apellido es requerido'",
  "'Valid email required'": "'Correo válido requerido'",
  "'RUT required'": "'RUT requerido'",
  "'Role required'": "'Rol requerido'",
  "'Plan name required'": "'Nombre del plan requerido'",
  "'Price required'": "'Precio requerido'",
  "'Duration required'": "'Duración requerida'",
  "'Student required'": "'Alumno requerido'",
  "'Amount required'": "'Monto requerido'",
  "'Payment method required'": "'Método de pago requerido'",
  "'Status required'": "'Estado requerido'",
  "'Institution name required'": "'Nombre de institución requerido'",
  "'Support phone required'": "'Teléfono de soporte requerido'",
  "'Phone required'": "'Teléfono requerido'",
  "'Plan required'": "'Plan requerido'",

  // Remaining labels and headers
  ">Personal Information<": ">Información Personal<",
  ">Academic Information<": ">Información Académica<",
  ">Active Status<": ">Estado de Actividad<",
  ">Active<": ">Activo<",
  ">Inactive<": ">Inactivo<",
  ">Notes<": ">Notas<",
  "label=\"Enrollment Date\"": "label=\"Fecha de Ingreso\"",
  "Save Student": "Guardar Alumno",
  "placeholder=\"Add any notes about the student...\"": "placeholder=\"Agrega notas sobre el alumno...\"",
  "label: 'Active'": "label: 'Activo'",
  "label: 'Inactive'": "label: 'Inactivo'",
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [eng, spa] of Object.entries(translations)) {
      if (content.includes(eng)) {
        content = content.split(eng).join(spa);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Translated file: ${filePath}`);
    }
  }
});

const constantsPath = path.join(__dirname, 'src', 'utils', 'constants.js');
if (fs.existsSync(constantsPath)) {
    let content = fs.readFileSync(constantsPath, 'utf8');
    let changed = false;
    const constTranslations = {
        "'Active'": "'Activo'",
        "'Inactive'": "'Inactivo'"
    };
    for (const [eng, spa] of Object.entries(constTranslations)) {
      if (content.includes(eng)) {
        content = content.split(eng).join(spa);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(constantsPath, content, 'utf8');
      console.log(`Translated file: ${constantsPath}`);
    }
}

console.log("Translation complete 2.");
