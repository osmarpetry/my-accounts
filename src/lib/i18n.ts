import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

// Only import browser language detector if we're on the client side
let LanguageDetector: typeof import('i18next-browser-languagedetector').default | undefined;
if (typeof window !== 'undefined') {
  import('i18next-browser-languagedetector').then((module) => {
    LanguageDetector = module.default;
  });
}

// Define the Locale type and available locales
export type Locale = 'en' | 'es' | 'fr' | 'de';
export const locales: Locale[] = ['en', 'es', 'fr', 'de'];
export const defaultLocale: Locale = 'en';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation & Layout
      "bankManagementSystem": "Bank Management System",
      "darkMode": "Dark Mode",
      "lightMode": "Light Mode",
      "systemMode": "System Mode",
      "defaultCurrency": "Default Currency",
      "language": "Language",
      
      // Account Management
      "accounts": "Accounts",
      "allAccounts": "All Accounts",
      "viewAllAccounts": "View All Accounts",
      "createAccount": "Create Account",
      "editAccount": "Edit Account",
      "deleteAccount": "Delete Account",
      "accountDetails": "Account Details",
      "accountHolder": "Account Holder",
      "accountNumber": "Account Number",
      "accountType": "Account Type",
      "balance": "Balance",
      "currency": "Currency",
      "status": "Status",
      "active": "Active",
      "inactive": "Inactive",
      "ownerId": "Owner ID",
      "initialBalance": "Initial Balance",
      
      // UI Labels and Text
      "currentAccount": "Current Account",
      "accountHolderName": "Account Holder Name",
      "accountStatus": "Account Status",
      "createNewAccount": "Create New Account",
      "updateAccount": "Update Account",
      "saving": "Saving...",
      "generate": "Generate",
      "enterFullName": "Enter full name",
      "selectAccountType": "Select account type",
      "selectCurrency": "Select currency",
      "characters": "characters",
      "currentAccountBalance": "Current account balance",
      "maximum": "Maximum",
      "uniqueIdentifierOwner": "6-digit unique identifier for the account owner",
      "accountActiveTransactions": "Account is active and can be used for transactions",
      "accountDisabledCannot": "Account is disabled and cannot be used",
      
      // Account Counts and Status
      "showing": "Showing",
      "account": "account",
      "of": "of",
      "totalManaged": "Total managed",
      "createFirstAccount": "Create your first account to get started",
      "filtered": "Filtered",
      "noMatchingAccounts": "No matching accounts",
      "adjustSearchCriteria": "Try adjusting your search criteria or clear the filters",
      "deleteConfirmation": "Are you sure you want to delete the account \"{{accountName}}\"? This action cannot be undone.",
      
      // Modal Titles and Messages
      "deactivateAccountWithBalance": "Deactivate Account with Balance",
      "balanceDeactivateWarning": "This account has a balance of {{balance}}. Deactivating it will prevent all transactions. Are you sure you want to proceed?",
      "keepActive": "Keep Active",
      "deactivateAccount": "Deactivate Account",
      "operationNotAllowed": "Operation Not Allowed",
      "serverError": "Server Error",
      "ok": "OK",
      
      // Account Types
      "checking": "Checking",
      "savings": "Savings",
      "credit": "Credit",
      "checkingDescription": "Everyday banking account",
      "savingsDescription": "Interest-earning account",
      "creditDescription": "Credit line account",
      
      // Search & Filters
      "search": "Search",
      "searchAccounts": "Search accounts...",
      "filters": "Filters",
      "sortBy": "Sort by",
      "selectSortOption": "Select sort option",
      "searchByName": "Search by name, account number, or owner ID",
      "filterByType": "Filter by account type",
      "filterByCurrency": "Filter by currency",
      "filterByStatus": "Filter by status",
      "clearFilters": "Clear filters",
      "minBalance": "Min Balance",
      "maxBalance": "Max Balance",
      
      // Transfers
      "transfer": "Transfer",
      "transferFunds": "Transfer Funds",
      "fromAccount": "From Account",
      "toAccount": "To Account",
      "amount": "Amount",
      "description": "Description",
      "transferDescriptionPlaceholder": "Enter transfer description",
      "currencyConversion": "Currency Conversion",
      "exchangeRate": "Exchange Rate",
      "youSend": "You send",
      "theyReceive": "They receive",
      "transferSummary": "Transfer Summary",
      "recipientGets": "Recipient gets",
      "from": "From",
      "to": "To",
      
      // Forms & Validation
      "required": "Required",
      "cancel": "Cancel",
      "save": "Save",
      "create": "Create",
      "update": "Update",
      "delete": "Delete",
      "confirm": "Confirm",
      "processing": "Processing...",
      "loading": "Loading...",
      
      // Messages & Notifications
      "success": "Success",
      "error": "Error",
      "warning": "Warning",
      "info": "Information",
      "noAccountsFound": "No accounts found",
      "accountCreated": "Account created successfully",
      "accountUpdated": "Account updated successfully",
      "accountDeleted": "Account deleted successfully",
      "transferCompleted": "Transfer completed successfully",
      
      // Validation Messages
      "fieldRequired": "This field is required",
      "invalidAmount": "Please enter a valid amount",
      "insufficientFunds": "Insufficient funds",
      "currencyMismatch": "Currency mismatch between accounts",
      "accountNotFound": "Account not found",
      "duplicateAccount": "An account with this information already exists",
      "ownerIdInvalid": "Owner ID must be a 6-digit number",
      "ownerIdRange": "Owner ID must be between 100000 and 999999",
      "ownerIdExists": "Owner ID already exists",
      "nameMinLength": "Name must be at least 2 characters",
      "nameMaxLength": "Name cannot exceed 100 characters",
      "nameInvalidCharacters": "Name can only contain letters, spaces, hyphens, and apostrophes",
      "negativeAmount": "Amount cannot be negative",
      "maxAmount": "Amount exceeds maximum limit",
      "minTransferAmount": "Minimum transfer amount is 0.01",
      "maxTransferAmount": "Maximum transfer amount is 100,000",
      "descriptionMinLength": "Description must be at least 3 characters",
      "descriptionMaxLength": "Description cannot exceed 200 characters",
      "cannotDeactivateWithBalance": "Cannot deactivate account with positive balance",
      "cannotDeleteWithBalance": "Cannot delete account with balance",
      "accountAlreadyExists": "Account already exists",
      "invalidCurrency": "Invalid currency selected",
      "invalidAccountType": "Invalid account type selected",
      
      // Currency Names
      "currencies": {
        "USD": "US Dollar",
        "EUR": "Euro",
        "GBP": "British Pound",
        "CHF": "Swiss Franc",
        "CNY": "Chinese Yuan",
        "SEK": "Swedish Krona",
        "NOK": "Norwegian Krone",
        "DKK": "Danish Krone",
        "PLN": "Polish Zloty",
        "CZK": "Czech Koruna",
        "HUF": "Hungarian Forint"
      },
      
      // Actions
      "actions": "Actions",
      "view": "View",
      "edit": "Edit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "refresh": "Refresh",
      
      // Time & Dates
      "createdAt": "Created At",
      "updatedAt": "Updated At",
      "available": "Available",
      "remaining": "Remaining"
    }
  },
  es: {
    translation: {
      // Navigation & Layout
      "bankManagementSystem": "Sistema de Gestión Bancaria",
      "darkMode": "Modo Oscuro",
      "lightMode": "Modo Claro",
      "systemMode": "Modo Sistema",
      "defaultCurrency": "Moneda Predeterminada",
      "language": "Idioma",
      
      // Account Management
      "accounts": "Cuentas",
      "allAccounts": "Todas las Cuentas",
      "viewAllAccounts": "Ver Todas las Cuentas",
      "createAccount": "Crear Cuenta",
      "editAccount": "Editar Cuenta",
      "deleteAccount": "Eliminar Cuenta",
      "accountDetails": "Detalles de la Cuenta",
      "accountHolder": "Titular de la Cuenta",
      "accountNumber": "Número de Cuenta",
      "accountType": "Tipo de Cuenta",
      "balance": "Saldo",
      "currency": "Moneda",
      "status": "Estado",
      "active": "Activa",
      "inactive": "Inactiva",
      "ownerId": "ID del Propietario",
      "initialBalance": "Saldo Inicial",
      
      // UI Labels and Text
      "currentAccount": "Cuenta Actual",
      "accountHolderName": "Nombre del Titular de la Cuenta",
      "accountStatus": "Estado de la Cuenta",
      "createNewAccount": "Crear Nueva Cuenta",
      "updateAccount": "Actualizar Cuenta",
      "saving": "Guardando...",
      "generate": "Generar",
      "enterFullName": "Ingrese el nombre completo",
      "selectAccountType": "Seleccionar tipo de cuenta",
      "selectCurrency": "Seleccionar moneda",
      "characters": "caracteres",
      "currentAccountBalance": "Saldo de la cuenta actual",
      "maximum": "Máximo",
      "uniqueIdentifierOwner": "6-dígito identificador único para el propietario de la cuenta",
      "accountActiveTransactions": "La cuenta está activa y puede usarse para transacciones",
      "accountDisabledCannot": "La cuenta está desactivada y no puede usarse",
      
      // Account Counts and Status
      "showing": "Mostrando",
      "account": "cuenta",
      "of": "de",
      "totalManaged": "Total gestionado",
      "createFirstAccount": "Cree su primera cuenta para comenzar",
      "filtered": "Filtrado",
      "noMatchingAccounts": "No hay cuentas que coincidan",
      "adjustSearchCriteria": "Intente ajustar los criterios de búsqueda o limpie los filtros",
      "deleteConfirmation": "¿Está seguro de que desea eliminar la cuenta \"{{accountName}}\"? Esta acción no se puede deshacer.",
      
      // Modal Titles and Messages
      "deactivateAccountWithBalance": "Desactivar Cuenta con Saldo",
      "balanceDeactivateWarning": "Esta cuenta tiene un saldo de {{balance}}. Desactivarlo impedirá todas las transacciones. ¿Está seguro de que desea proceder?",
      "keepActive": "Mantener Activa",
      "deactivateAccount": "Desactivar Cuenta",
      "operationNotAllowed": "Operación No Permitida",
      "serverError": "Error del Servidor",
      "ok": "Aceptar",
      
      // Account Types
      "checking": "Corriente",
      "savings": "Ahorros",
      "credit": "Crédito",
      "checkingDescription": "Cuenta bancaria diaria",
      "savingsDescription": "Cuenta que genera intereses",
      "creditDescription": "Cuenta de línea de crédito",
      
      // Search & Filters
      "search": "Buscar",
      "searchAccounts": "Buscar cuentas...",
      "filters": "Filtros",
      "sortBy": "Ordenar por",
      "selectSortOption": "Seleccionar opción de ordenación",
      "searchByName": "Buscar por nombre, número de cuenta o ID del propietario",
      "filterByType": "Filtrar por tipo de cuenta",
      "filterByCurrency": "Filtrar por moneda",
      "filterByStatus": "Filtrar por estado",
      "clearFilters": "Limpiar filtros",
      "minBalance": "Saldo Mínimo",
      "maxBalance": "Saldo Máximo",
      
      // Transfers
      "transfer": "Transferir",
      "transferFunds": "Transferir Fondos",
      "fromAccount": "Desde Cuenta",
      "toAccount": "Hacia Cuenta",
      "amount": "Cantidad",
      "description": "Descripción",
      "transferDescriptionPlaceholder": "Ingrese descripción de la transferencia",
      "currencyConversion": "Conversión de Moneda",
      "exchangeRate": "Tipo de Cambio",
      "youSend": "Usted envía",
      "theyReceive": "Ellos reciben",
      "transferSummary": "Resumen de Transferencia",
      "recipientGets": "El destinatario recibe",
      "from": "De",
      "to": "Para",
      
      // Forms & Validation
      "required": "Requerido",
      "cancel": "Cancelar",
      "save": "Guardar",
      "create": "Crear",
      "update": "Actualizar",
      "delete": "Eliminar",
      "confirm": "Confirmar",
      "processing": "Procesando...",
      "loading": "Cargando...",
      
      // Messages & Notifications
      "success": "Éxito",
      "error": "Error",
      "warning": "Advertencia",
      "info": "Información",
      "noAccountsFound": "No se encontraron cuentas",
      "accountCreated": "Cuenta creada exitosamente",
      "accountUpdated": "Cuenta actualizada exitosamente",
      "accountDeleted": "Cuenta eliminada exitosamente",
      "transferCompleted": "Transferencia completada exitosamente",
      
      // Validation Messages
      "fieldRequired": "Este campo es obligatorio",
      "invalidAmount": "Por favor ingrese un monto válido",
      "insufficientFunds": "Fondos insuficientes",
      "currencyMismatch": "Discrepancia de moneda entre cuentas",
      "accountNotFound": "Cuenta no encontrada",
      "duplicateAccount": "Ya existe una cuenta con esta información",
      "ownerIdInvalid": "El ID del propietario debe ser un número de 6 dígitos",
      "ownerIdRange": "El ID del propietario debe estar entre 100000 y 999999",
      "ownerIdExists": "El ID del propietario ya existe",
      "nameMinLength": "El nombre debe tener al menos 2 caracteres",
      "nameMaxLength": "El nombre no puede exceder 100 caracteres",
      "nameInvalidCharacters": "El nombre solo puede contener letras, espacios, guiones y apostrofes",
      "negativeAmount": "La cantidad no puede ser negativa",
      "maxAmount": "La cantidad excede el límite máximo",
      "minTransferAmount": "La cantidad mínima de transferencia es 0.01",
      "maxTransferAmount": "La cantidad máxima de transferencia es 100,000",
      "descriptionMinLength": "La descripción debe tener al menos 3 caracteres",
      "descriptionMaxLength": "La descripción no puede exceder 200 caracteres",
      "cannotDeactivateWithBalance": "No se puede desactivar una cuenta con saldo positivo",
      "cannotDeleteWithBalance": "No se puede eliminar una cuenta con saldo",
      "accountAlreadyExists": "La cuenta ya existe",
      "invalidCurrency": "Moneda inválida seleccionada",
      "invalidAccountType": "Tipo de cuenta inválido seleccionado",
      
      // Currency Names
      "currencies": {
        "USD": "US Dollar",
        "EUR": "Euro",
        "GBP": "British Pound",
        "CHF": "Swiss Franc",
        "CNY": "Chinese Yuan",
        "SEK": "Swedish Krona",
        "NOK": "Norwegian Krone",
        "DKK": "Danish Krone",
        "PLN": "Polish Zloty",
        "CZK": "Czech Koruna",
        "HUF": "Hungarian Forint"
      },
      
      // Actions
      "actions": "Acciones",
      "view": "Ver",
      "edit": "Editar",
      "close": "Cerrar",
      "back": "Atrás",
      "next": "Siguiente",
      "previous": "Anterior",
      "refresh": "Actualizar",
      
      // Time & Dates
      "createdAt": "Creado En",
      "updatedAt": "Actualizado En",
      "available": "Disponible",
      "remaining": "Restante"
    }
  },
  fr: {
    translation: {
      // Navigation & Layout
      "bankManagementSystem": "Système de Gestion Bancaire",
      "darkMode": "Mode Sombre",
      "lightMode": "Mode Clair",
      "systemMode": "Mode Système",
      "defaultCurrency": "Devise Par Défaut",
      "language": "Langue",
      
      // Account Management
      "accounts": "Comptes",
      "allAccounts": "Tous les Comptes",
      "viewAllAccounts": "Voir Tous les Comptes",
      "createAccount": "Créer un Compte",
      "editAccount": "Modifier le Compte",
      "deleteAccount": "Supprimer le Compte",
      "accountDetails": "Détails du Compte",
      "accountHolder": "Titulaire du Compte",
      "accountNumber": "Numéro de Compte",
      "accountType": "Type de Compte",
      "balance": "Solde",
      "currency": "Devise",
      "status": "Statut",
      "active": "Actif",
      "inactive": "Inactif",
      "ownerId": "ID du Propriétaire",
      "initialBalance": "Solde Initial",
      
      // UI Labels and Text
      "currentAccount": "Compte Courant",
      "accountHolderName": "Nom du Titulaire du Compte",
      "accountStatus": "État du Compte",
      "createNewAccount": "Créer un Nouveau Compte",
      "updateAccount": "Mettre à Jour le Compte",
      "saving": "Enregistrement...",
      "generate": "Générer",
      "enterFullName": "Entrez le nom complet",
      "selectAccountType": "Sélectionner le Type de Compte",
      "selectCurrency": "Sélectionner la Monnaie",
      "characters": "caractères",
      "currentAccountBalance": "Solde du Compte Courant",
      "maximum": "Maximum",
      "uniqueIdentifierOwner": "6-chiffre identifiant unique pour le propriétaire du compte",
      "accountActiveTransactions": "Le compte est actif et peut être utilisé pour des transactions",
      "accountDisabledCannot": "Le compte est désactivé et ne peut être utilisé",
      
      // Account Counts and Status
      "showing": "Affichage",
      "account": "compte",
      "of": "de",
      "totalManaged": "Total géré",
      "createFirstAccount": "Créez votre premier compte pour commencer",
      "filtered": "Filtré",
      "noMatchingAccounts": "Aucun compte correspondant trouvé",
      "adjustSearchCriteria": "Essayez d'ajuster vos critères de recherche ou effacez les filtres",
      "deleteConfirmation": "Êtes-vous sûr de vouloir supprimer le compte \"{{accountName}}\"? Cette action est irréversible.",
      
      // Modal Titles and Messages
      "deactivateAccountWithBalance": "Désactiver le Compte avec Solde",
      "balanceDeactivateWarning": "Ce compte a un solde de {{balance}}. Désactiver cela empêchera toutes les transactions. Êtes-vous sûr de vouloir procéder ?",
      "keepActive": "Garder Actif",
      "deactivateAccount": "Désactiver le Compte",
      "operationNotAllowed": "Opération Non Autorisée",
      "serverError": "Erreur du Serveur",
      "ok": "OK",
      
      // Account Types
      "checking": "Chèques",
      "savings": "Épargne",
      "credit": "Crédit",
      "checkingDescription": "Compte bancaire quotidien",
      "savingsDescription": "Compte générateur d'intérêts",
      "creditDescription": "Compte de ligne de crédit",
      
      // Search & Filters
      "search": "Rechercher",
      "searchAccounts": "Rechercher des comptes...",
      "filters": "Filtres",
      "sortBy": "Trier par",
      "selectSortOption": "Sélectionner une option de tri",
      "searchByName": "Rechercher par nom, numéro de compte ou ID du propriétaire",
      "filterByType": "Filtrer par type de compte",
      "filterByCurrency": "Filtrer par devise",
      "filterByStatus": "Filtrer par état",
      "clearFilters": "Effacer les filtres",
      "minBalance": "Solde Minimum",
      "maxBalance": "Solde Maximum",
      
      // Transfers
      "transfer": "Transférer",
      "transferFunds": "Transférer des Fonds",
      "fromAccount": "Du Compte",
      "toAccount": "Vers le Compte",
      "amount": "Montant",
      "description": "Description",
      "transferDescriptionPlaceholder": "Entrez la description du transfert",
      "currencyConversion": "Conversion de Devise",
      "exchangeRate": "Taux de Change",
      "youSend": "Vous envoyez",
      "theyReceive": "Ils reçoivent",
      "transferSummary": "Résumé du Transfert",
      "recipientGets": "Le destinataire reçoit",
      "from": "De",
      "to": "À",
      
      // Forms & Validation
      "required": "Requis",
      "cancel": "Annuler",
      "save": "Enregistrer",
      "create": "Créer",
      "update": "Mettre à jour",
      "delete": "Supprimer",
      "confirm": "Confirmer",
      "processing": "Traitement...",
      "loading": "Chargement...",
      
      // Messages & Notifications
      "success": "Succès",
      "error": "Erreur",
      "warning": "Avertissement",
      "info": "Information",
      "noAccountsFound": "Aucun compte trouvé",
      "accountCreated": "Compte créé avec succès",
      "accountUpdated": "Compte mis à jour avec succès",
      "accountDeleted": "Compte supprimé avec succès",
      "transferCompleted": "Transfert effectué avec succès",
      
      // Validation Messages
      "fieldRequired": "Ce champ est obligatoire",
      "invalidAmount": "Veuillez saisir un montant valide",
      "insufficientFunds": "Fonds insuffisants",
      "currencyMismatch": "Discordance de devise entre les comptes",
      "accountNotFound": "Compte non trouvé",
      "duplicateAccount": "Un compte avec ces informations existe déjà",
      "ownerIdInvalid": "L'ID du propriétaire doit être un nombre à 6 chiffres",
      "ownerIdRange": "L'ID du propriétaire doit être entre 100000 et 999999",
      "ownerIdExists": "L'ID du propriétaire existe déjà",
      "nameMinLength": "Le nom doit contenir au moins 2 caractères",
      "nameMaxLength": "Le nom ne peut pas dépasser 100 caractères",
      "nameInvalidCharacters": "Le nom ne peut contenir que des lettres, des espaces, des tirets et des apostrophes",
      "negativeAmount": "Le montant ne peut pas être négatif",
      "maxAmount": "Le montant dépasse la limite maximale",
      "minTransferAmount": "Le montant minimum de transfert est 0.01",
      "maxTransferAmount": "Le montant maximum de transfert est 100,000",
      "descriptionMinLength": "La description doit contenir au moins 3 caractères",
      "descriptionMaxLength": "La description ne peut pas dépasser 200 caractères",
      "cannotDeactivateWithBalance": "Impossible de désactiver un compte avec un solde positif",
      "cannotDeleteWithBalance": "Impossible de supprimer un compte avec un solde",
      "accountAlreadyExists": "Le compte existe déjà",
      "invalidCurrency": "Devise invalide sélectionnée",
      "invalidAccountType": "Type de compte invalide sélectionné",
      
      // Currency Names
      "currencies": {
        "USD": "US Dollar",
        "EUR": "Euro",
        "GBP": "British Pound",
        "CHF": "Swiss Franc",
        "CNY": "Chinese Yuan",
        "SEK": "Swedish Krona",
        "NOK": "Norwegian Krone",
        "DKK": "Danish Krone",
        "PLN": "Polish Zloty",
        "CZK": "Czech Koruna",
        "HUF": "Hungarian Forint"
      },
      
      // Actions
      "actions": "Actions",
      "view": "Voir",
      "edit": "Modifier",
      "close": "Fermer",
      "back": "Retour",
      "next": "Suivant",
      "previous": "Précédent",
      "refresh": "Actualiser",
      
      // Time & Dates
      "createdAt": "Créé le",
      "updatedAt": "Mis à jour le",
      "available": "Disponible",
      "remaining": "Restant"
    }
  },
  de: {
    translation: {
      // Navigation & Layout
      "bankManagementSystem": "Bank-Management-System",
      "darkMode": "Dunkler Modus",
      "lightMode": "Heller Modus",
      "systemMode": "System-Modus",
      "defaultCurrency": "Standardwährung",
      "language": "Sprache",
      
      // Account Management
      "accounts": "Konten",
      "allAccounts": "Alle Konten",
      "viewAllAccounts": "Alle Konten anzeigen",
      "createAccount": "Konto erstellen",
      "editAccount": "Konto bearbeiten",
      "deleteAccount": "Konto löschen",
      "accountDetails": "Kontodetails",
      "accountHolder": "Kontoinhaber",
      "accountNumber": "Kontonummer",
      "accountType": "Kontotyp",
      "balance": "Saldo",
      "currency": "Währung",
      "status": "Status",
      "active": "Aktiv",
      "inactive": "Inaktiv",
      "ownerId": "Eigentümer-ID",
      "initialBalance": "Anfangssaldo",
      
      // UI Labels and Text
      "currentAccount": "Current Account",
      "accountHolderName": "Account Holder Name",
      "accountStatus": "Account Status",
      "createNewAccount": "Create New Account",
      "updateAccount": "Update Account",
      "saving": "Saving...",
      "generate": "Generate",
      "enterFullName": "Enter full name",
      "selectAccountType": "Select account type",
      "selectCurrency": "Select currency",
      "characters": "characters",
      "currentAccountBalance": "Current account balance",
      "maximum": "Maximum",
      "uniqueIdentifierOwner": "6-digit unique identifier for the account owner",
      "accountActiveTransactions": "Account is active and can be used for transactions",
      "accountDisabledCannot": "Account is disabled and cannot be used",
      
      // Account Counts and Status
      "showing": "Showing",
      "account": "account",
      "of": "of",
      "totalManaged": "Total managed",
      "createFirstAccount": "Create your first account to get started",
      "filtered": "Filtered",
      "noMatchingAccounts": "No matching accounts",
      "adjustSearchCriteria": "Try adjusting your search criteria or clear the filters",
      "deleteConfirmation": "Are you sure you want to delete the account \"{{accountName}}\"? This action cannot be undone.",
      
      // Modal Titles and Messages
      "deactivateAccountWithBalance": "Deactivate Account with Balance",
      "balanceDeactivateWarning": "This account has a balance of {{balance}}. Deactivating it will prevent all transactions. Are you sure you want to proceed?",
      "keepActive": "Keep Active",
      "deactivateAccount": "Deactivate Account",
      "operationNotAllowed": "Operation Not Allowed",
      "serverError": "Server Error",
      "ok": "OK",
      
      // Account Types
      "checking": "Girokonto",
      "savings": "Sparkonto",
      "credit": "Kreditkonto",
      "checkingDescription": "Alltägliches Bankkonto",
      "savingsDescription": "Zinsertragendes Konto",
      "creditDescription": "Kreditlinienkonto",
      
      // Search & Filters
      "search": "Suchen",
      "searchAccounts": "Konten suchen...",
      "filters": "Filter",
      "sortBy": "Sortieren",
      "selectSortOption": "Sortierungsoption auswählen",
      "searchByName": "Nach Name, Kontonummer oder Eigentümer-ID suchen",
      "filterByType": "Nach Kontotyp filtern",
      "filterByCurrency": "Nach Währung filtern",
      "filterByStatus": "Nach Status filtern",
      "clearFilters": "Filter löschen",
      "minBalance": "Mindestbetrag",
      "maxBalance": "Höchstbetrag",
      
      // Transfers
      "transfer": "Übertragen",
      "transferFunds": "Geld überweisen",
      "fromAccount": "Von Konto",
      "toAccount": "Zu Konto",
      "amount": "Betrag",
      "description": "Beschreibung",
      "transferDescriptionPlaceholder": "Überweisungsbeschreibung eingeben",
      "currencyConversion": "Währungsumrechnung",
      "exchangeRate": "Wechselkurs",
      "youSend": "Sie senden",
      "theyReceive": "Sie erhalten",
      "transferSummary": "Überweisungsübersicht",
      "recipientGets": "Empfänger erhält",
      "from": "Von",
      "to": "An",
      
      // Forms & Validation
      "required": "Erforderlich",
      "cancel": "Abbrechen",
      "save": "Speichern",
      "create": "Erstellen",
      "update": "Aktualisieren",
      "delete": "Löschen",
      "confirm": "Bestätigen",
      "processing": "Verarbeitung...",
      "loading": "Laden...",
      
      // Messages & Notifications
      "success": "Erfolg",
      "error": "Fehler",
      "warning": "Warnung",
      "info": "Information",
      "noAccountsFound": "Keine Konten gefunden",
      "accountCreated": "Konto erfolgreich erstellt",
      "accountUpdated": "Konto erfolgreich aktualisiert",
      "accountDeleted": "Konto erfolgreich gelöscht",
      "transferCompleted": "Überweisung erfolgreich abgeschlossen",
      
      // Validation Messages
      "fieldRequired": "Dieses Feld ist erforderlich",
      "invalidAmount": "Bitte geben Sie einen gültigen Betrag ein",
      "insufficientFunds": "Unzureichende Mittel",
      "currencyMismatch": "Währungskonflikt zwischen Konten",
      "accountNotFound": "Konto nicht gefunden",
      "duplicateAccount": "Ein Konto mit diesen Informationen existiert bereits",
      "ownerIdInvalid": "Eigentümer-ID muss eine 6-stellige Zahl sein",
      "ownerIdRange": "Eigentümer-ID muss zwischen 100000 und 999999 liegen",
      "ownerIdExists": "Eigentümer-ID existiert bereits",
      "nameMinLength": "Name muss mindestens 2 Zeichen haben",
      "nameMaxLength": "Name darf 100 Zeichen nicht überschreiten",
      "nameInvalidCharacters": "Name darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten",
      "negativeAmount": "Betrag kann nicht negativ sein",
      "maxAmount": "Betrag überschreitet das maximale Limit",
      "minTransferAmount": "Mindestüberweisungsbetrag ist 0.01",
      "maxTransferAmount": "Höchstüberweisungsbetrag ist 100,000",
      "descriptionMinLength": "Beschreibung muss mindestens 3 Zeichen haben",
      "descriptionMaxLength": "Beschreibung darf 200 Zeichen nicht überschreiten",
      "cannotDeactivateWithBalance": "Konto mit positivem Saldo kann nicht deaktiviert werden",
      "cannotDeleteWithBalance": "Konto mit Saldo kann nicht gelöscht werden",
      "accountAlreadyExists": "Konto existiert bereits",
      "invalidCurrency": "Ungültige Währung ausgewählt",
      "invalidAccountType": "Ungültiger Kontotyp ausgewählt",
      
      // Currency Names
      "currencies": {
        "USD": "US Dollar",
        "EUR": "Euro",
        "GBP": "British Pound",
        "CHF": "Swiss Franc",
        "CNY": "Chinese Yuan",
        "SEK": "Swedish Krona",
        "NOK": "Norwegian Krone",
        "DKK": "Danish Krone",
        "PLN": "Polish Zloty",
        "CZK": "Czech Koruna",
        "HUF": "Hungarian Forint"
      },
      
      // Actions
      "actions": "Aktionen",
      "view": "Anzeigen",
      "edit": "Bearbeiten",
      "close": "Schließen",
      "back": "Zurück",
      "next": "Weiter",
      "previous": "Vorherige",
      "refresh": "Aktualisieren",
      
      // Time & Dates
      "createdAt": "Erstellt am",
      "updatedAt": "Aktualisiert am",
      "available": "Verfügbar",
      "remaining": "Verbleibend"
    }
  }
};

// Initialize i18n with conditional language detection
const initI18n = () => {
  const i18nInstance = i18n.use(initReactI18next);
  
  // Only use language detector on client side
  if (typeof window !== 'undefined' && LanguageDetector) {
    i18nInstance.use(LanguageDetector);
    
    return i18nInstance.init({
      resources,
      fallbackLng: defaultLocale,
      lng: defaultLocale,
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    });
  } else {
    // Server-side initialization without language detection
    return i18nInstance.init({
      resources,
      fallbackLng: defaultLocale,
      lng: defaultLocale,
      debug: false,
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

// Initialize immediately
initI18n();

// Export everything needed
export { useTranslation };
export default i18n;
