const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

const translations = {
  // Alumnos
  '"Create Student"': '"Crear Alumno"',
  '"Edit Student"': '"Editar Alumno"',
  '"Student Profile"': '"Perfil del Alumno"',
  '"New Student"': '"Nuevo Alumno"',
  '"Delete Student"': '"Eliminar Alumno"',
  '"No students found"': '"No se encontraron alumnos"',
  '"Are you sure you want to delete this student? This action cannot be undone."': '"¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer."',
  'label="Student"': 'label="Alumno"',
  'label="First Name"': 'label="Primer Nombre"',
  'label="Middle Name"': 'label="Segundo Nombre"',
  'label="Last Name"': 'label="Primer Apellido"',
  'label="Second Last Name"': 'label="Segundo Apellido"',
  'label="Phone"': 'label="Teléfono"',
  'label="Email"': 'label="Correo Eléctronico"',
  'label="Plan"': 'label="Plan"',
  'label="Observations"': 'label="Observaciones"',
  '"Cancel"': '"Cancelar"',
  '"Save Changes"': '"Guardar Cambios"',
  'label="Active"': 'label="Activo"',
  '"Active"': '"Activo"',
  '"Inactive"': '"Inactivo"',

  // Pagos
  '"Payments"': '"Pagos"',
  '"Register Payment"': '"Registrar Pago"',
  '"Edit Payment"': '"Editar Pago"',
  '"Create Payment"': '"Crear Pago"',
  '"Delete Payment"': '"Eliminar Pago"',
  '"No payments found"': '"No se encontraron pagos"',
  'placeholder="Search payment..."': 'placeholder="Buscar pago..."',
  'label="Payment Date"': 'label="Fecha de Pago"',
  'label="Amount"': 'label="Monto"',
  'label="Status"': 'label="Estado"',
  'label="Method"': 'label="Método"',
  'label="Reference"': 'label="Referencia"',
  'label="Actions"': 'label="Acciones"',
  '"Are you sure you want to delete this payment?"': '"¿Estás seguro de que deseas eliminar este pago?"',

  // Planes
  '"Plans"': '"Planes"',
  '"Create Plan"': '"Crear Plan"',
  '"Edit Plan"': '"Editar Plan"',
  '"Delete Plan"': '"Eliminar Plan"',
  '"No plans found"': '"No se encontraron planes"',
  'label="Name"': 'label="Nombre"',
  'label="Price CLP"': 'label="Precio CLP"',
  'label="Price USD"': 'label="Precio USD"',
  'label="Classes per Week"': 'label="Clases por Semana"',
  '"Are you sure you want to delete this plan?"': '"¿Estás seguro de que deseas eliminar este plan?"',
  'placeholder="Search plans..."': 'placeholder="Buscar planes..."',

  // Usuarios
  '"Users"': '"Usuarios"',
  '"Create User"': '"Crear Usuario"',
  '"Edit User"': '"Editar Usuario"',
  '"User Profile"': '"Perfil de Usuario"',
  '"Delete User"': '"Eliminar Usuario"',
  '"No users found"': '"No se encontraron usuarios"',
  'placeholder="Search users..."': 'placeholder="Buscar usuarios..."',
  '"Are you sure you want to delete this user?"': '"¿Estás seguro de que deseas eliminar este usuario?"',
  'label="Role"': 'label="Rol"',
  'label="Password"': 'label="Contraseña"',
  'label="Leave blank to keep current password"': 'label="Dejar en blanco para mantener la actual"',

  // General Dashboard / Config
  '"Dashboard"': '"Panel Principal"',
  '"Settings"': '"Configuración"',
  '"Notifications"': '"Notificaciones"',
  '"Personal Information"': '"Información Personal"',
  '"Account Status"': '"Estado de Cuenta"',
  '"Payment History"': '"Historial de Pagos"',
  '"Class Schedule"': '"Horario de Clases"',
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.jsx')) {
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

const sidebarPath = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.jsx');
if (fs.existsSync(sidebarPath)) {
    let content = fs.readFileSync(sidebarPath, 'utf8');
    let changed = false;
    const sidebarTranslations = {
        'label: \'Dashboard\'': 'label: \'Panel Principal\'',
        'label: \'Students\'': 'label: \'Alumnos\'',
        'label: \'Plans\'': 'label: \'Planes\'',
        'label: \'Payments\'': 'label: \'Pagos\'',
        'label: \'Schedules\'': 'label: \'Horarios\'',
        'label: \'Users\'': 'label: \'Usuarios\'',
        'label: \'Settings\'': 'label: \'Configuración\'',
        'label: \'Profile\'': 'label: \'Perfil\'',
        'label: \'Logout\'': 'label: \'Cerrar Sesión\''
    };
    for (const [eng, spa] of Object.entries(sidebarTranslations)) {
      if (content.includes(eng)) {
        content = content.split(eng).join(spa);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(sidebarPath, content, 'utf8');
      console.log(`Translated file: ${sidebarPath}`);
    }
}

console.log("Translation complete.");
