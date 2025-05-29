export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const messages = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      save: "Save",
      create: "Create",
      update: "Update",
    },
    nav: {
      bankAccounts: "Bank Accounts",
      addAccount: "Add Account",
      switchLanguage: "Switch Language",
    },
    accounts: {
      title: "Bank Accounts",
      subtitle: "Manage your bank accounts and transactions",
      totalBalance: "Total Balance",
      activeAccounts: "Active Accounts",
      accountTypes: "Account Types",
      yourAccounts: "Your Accounts",
      noAccountsTitle: "No accounts found",
      noAccountsMessage: "Get started by creating your first bank account.",
      createAccount: "Create Account",
      deleteAccount: "Delete Account",
      deleteConfirmation:
        "Are you sure you want to delete the account for {name}? This action cannot be undone.",
      deleting: "Deleting...",
      active: "Active",
      inactive: "Inactive",
      created: "Created {date}",
      acrossAllActive: "Across all active accounts",
      totalManaged: "Total accounts managed",
    },
    forms: {
      accountHolder: "Account Holder",
      accountType: "Account Type",
      initialBalance: "Initial Balance",
      balance: "Balance",
      currency: "Currency",
      accountActive: "Account is active",
      createNewAccount: "Create New Account",
      editAccount: "Edit Account",
      updateAccount: "Update Account",
      saving: "Saving...",
      accountHolderRequired: "Account holder name is required",
      accountHolderMinLength:
        "Account holder name must be at least 2 characters",
      accountHolderInvalid:
        "Account holder name can only contain letters and spaces",
      balanceInvalid: "Balance must be a valid number",
      balanceNegative: "Balance cannot be negative",
      balanceMax: "Balance cannot exceed $1,000,000",
    },
  },
  fr: {
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      confirm: "Confirmer",
      delete: "Supprimer",
      edit: "Modifier",
      save: "Sauvegarder",
      create: "Créer",
      update: "Mettre à jour",
    },
    nav: {
      bankAccounts: "Comptes Bancaires",
      addAccount: "Ajouter un Compte",
      switchLanguage: "Changer de Langue",
    },
    accounts: {
      title: "Comptes Bancaires",
      subtitle: "Gérez vos comptes bancaires et transactions",
      totalBalance: "Solde Total",
      activeAccounts: "Comptes Actifs",
      accountTypes: "Types de Comptes",
      yourAccounts: "Vos Comptes",
      noAccountsTitle: "Aucun compte trouvé",
      noAccountsMessage: "Commencez en créant votre premier compte bancaire.",
      createAccount: "Créer un Compte",
      deleteAccount: "Supprimer le Compte",
      deleteConfirmation:
        "Êtes-vous sûr de vouloir supprimer le compte de {name} ? Cette action ne peut pas être annulée.",
      deleting: "Suppression...",
      active: "Actif",
      inactive: "Inactif",
      created: "Créé le {date}",
      acrossAllActive: "À travers tous les comptes actifs",
      totalManaged: "Total des comptes gérés",
    },
    forms: {
      accountHolder: "Titulaire du Compte",
      accountType: "Type de Compte",
      initialBalance: "Solde Initial",
      balance: "Solde",
      currency: "Devise",
      accountActive: "Le compte est actif",
      createNewAccount: "Créer un Nouveau Compte",
      editAccount: "Modifier le Compte",
      updateAccount: "Mettre à Jour le Compte",
      saving: "Sauvegarde...",
      accountHolderRequired: "Le nom du titulaire du compte est requis",
      accountHolderMinLength:
        "Le nom du titulaire doit contenir au moins 2 caractères",
      accountHolderInvalid:
        "Le nom du titulaire ne peut contenir que des lettres et des espaces",
      balanceInvalid: "Le solde doit être un nombre valide",
      balanceNegative: "Le solde ne peut pas être négatif",
      balanceMax: "Le solde ne peut pas dépasser 1 000 000 $",
    },
  },
} as const;

export function useTranslation(locale: Locale = defaultLocale) {
  return {
    t: (key: string, params?: Record<string, string>) => {
      const keys = key.split(".");
      let value: unknown = messages[locale];

      for (const k of keys) {
        if (typeof value === "object" && value !== null && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key; // Return key if path not found
        }
      }

      if (typeof value !== "string") {
        return key; // Return key if translation not found
      }

      if (params) {
        return Object.entries(params).reduce(
          (str, [paramKey, paramValue]) =>
            str.replace(`{${paramKey}}`, paramValue),
          value
        );
      }

      return value;
    },
    locale,
  };
}
