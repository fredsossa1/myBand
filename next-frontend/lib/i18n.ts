// Internationalization (i18n) support for the Band Availability System
// Supports English and French languages

export type Language = "en" | "fr";

export interface Translations {
  // App Title and Navigation
  appTitle: string;
  appSubtitle: string;
  bandAvailabilitySystem: string;
  manageAvailabilityDescription: string;

  // Navigation
  home: string;
  availability: string;
  statistics: string;

  // General UI
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  submit: string;
  delete: string;
  edit: string;
  add: string;
  refresh: string;
  clear: string;
  login: string;
  logout: string;
  language: string;
  adminMode: string;
  back: string;
  next: string;
  previous: string;
  close: string;

  // Admin Section
  adminAccess: string;
  adminLogin: string;
  adminLogout: string;
  adminPassword: string;
  adminGranted: string;
  adminRequired: string;
  adminExpired: string;
  addEvent: string;
  manageEvents: string;

  // User Selection
  selectName: string;
  chooseYourName: string;
  welcome: string;
  yourName: string;

  // Availability States
  available: string;
  unavailable: string;
  uncertain: string;
  notResponded: string;

  // Availability Actions
  setAvailable: string;
  setUnavailable: string;
  setUncertain: string;
  bulkAvailable: string;
  bulkUnavailable: string;
  bulkUncertain: string;
  yourAvailability: string;

  // Team and Roles
  bassist: string;
  pianist: string;
  drummer: string;
  lead: string;
  backgroundVocals: string;
  violinist: string;
  admin: string;

  // Statistics
  stats: string;
  teamStats: string;
  teamEngagement: string;
  upcomingEvents: string;
  bandMembers: string;
  overallResponseRate: string;
  yourResponseRate: string;
  totalEvents: string;
  totalMembers: string;
  totalResponses: string;
  responses: string;
  responded: string;

  // Events
  events: string;
  event: string;
  eventTitle: string;
  eventTitlePlaceholder: string;
  eventDate: string;
  eventDescription: string;
  eventDescriptionPlaceholder: string;
  eventType: string;
  noEvents: string;
  noEventsDesc: string;
  addNewEvent: string;
  addEventDescription: string;
  descriptionOptional: string;

  // Actions and Messages (new ones only)
  adding: string;

  // Admin Messages (new ones only)
  invalidAdminPassword: string;
  adminAccessRequired: string;
  adminSessionExpired: string;
  adminControls: string;
  failedToAddEvent: string;
  loginToManageEvents: string;
  adminAccessGranted: string;
  adminManageDescription: string;

  // Loading States (new ones only)
  loadingAvailabilityData: string;
  errorLoadingData: string;

  // Event Types
  service: string;
  bandOnly: string;
  jamSession: string;
  specialEvent: string;

  // Coverage
  coverage: string;
  bandCoverage: string;
  fullyCovered: string;
  availableMembers: string;
  partiallyCovered: string;
  notCovered: string;
  coverageScore: string;
  required: string;
  jamSessionEncouragement: string;
  specialGuestPerformance: string;
  willJoinOnViolin: string;

  // Changes and Actions
  pendingChanges: string;
  unsavedChanges: string;
  unsavedChange: string;
  unsavedChangesDescription: string;
  changesLocal: string;
  submitChanges: string;
  discardChanges: string;
  discardAll: string;
  submitAllChanges: string;
  undoAction: string;
  undoAvailable: string;
  undoDescription: string;

  // Keyboard Shortcuts
  keyboardShortcuts: string;
  shortcuts: string;
  globalShortcuts: string;
  refreshData: string;
  undoLast: string;
  saveChanges: string;
  showHelp: string;

  // Messages and Feedback
  loadingData: string;
  errorLoading: string;
  tryAgain: string;
  noResponsesYet: string;
  beFirstToRespond: string;
  sessionExpired: string;
  loginFailed: string;
  addEventSuccess: string;
  addEventFailed: string;

  // Dates and Time
  date: string;
  today: string;
  upcoming: string;
  past: string;

  // Form Validation
  required_field: string;
  invalid_date: string;
  invalid_email: string;

  // Bulk Actions
  bulkActions: string;
  bulkSetTitle: string;
  bulkSelectEvents: string;
  selectAll: string;
  deselectAll: string;
  selectEvents: string;
  setForMultiple: string;
  bulk: string;

  // Planning Center Integration
  exportCsv: string;
  planningCenter: string;
  exportData: string;

  // Responsive Messages
  excellent: string;
  goodJob: string;
  keepImproving: string;
  pleaseRespond: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // App Title and Navigation
    appTitle: "Band Availability System",
    appSubtitle: "Manage your availability for upcoming events",
    bandAvailabilitySystem: "Band Availability System",
    manageAvailabilityDescription:
      "Manage your availability for upcoming events",

    // Navigation
    home: "Home",
    availability: "Availability",
    statistics: "Statistics",

    // General UI
    loading: "Loading",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    submit: "Submit",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    refresh: "Refresh",
    clear: "Clear",
    login: "Login",
    logout: "Logout",
    language: "Language",
    adminMode: "Admin Mode",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",

    // Admin Section
    adminAccess: "Admin Access",
    adminLogin: "Admin Login",
    adminLogout: "Admin Logout",
    adminPassword: "Admin password",
    adminGranted: "Admin Access Granted",
    adminRequired: "Admin access required",
    adminExpired: "Admin session expired. Please login again.",
    addEvent: "Add Event",
    manageEvents: "Login to manage events",
    invalidAdminPassword: "Invalid admin password",
    adminAccessRequired: "Admin access required",
    adminSessionExpired: "Admin session expired. Please login again.",
    adminControls: "Admin Controls",
    failedToAddEvent: "Failed to add event",
    loginToManageEvents: "Login to manage events",
    adminAccessGranted: "Admin Access Granted",
    adminManageDescription: "You can now manage events and view statistics",

    // User Selection
    selectName: "Select your name",
    chooseYourName: "Choose your name...",
    welcome: "Welcome",
    yourName: "Your Name",

    // Availability States
    available: "Available",
    unavailable: "Unavailable",
    uncertain: "Uncertain",
    notResponded: "Not Responded",

    // Availability Actions
    setAvailable: "Set Available",
    setUnavailable: "Set Unavailable",
    setUncertain: "Set Uncertain",
    bulkAvailable: "Bulk Available",
    bulkUnavailable: "Bulk Unavailable",
    bulkUncertain: "Bulk Uncertain",
    yourAvailability: "Your Availability",

    // Team and Roles
    bassist: "Bassist",
    pianist: "Pianist",
    drummer: "Drummer",
    lead: "Lead Vocals",
    backgroundVocals: "Background Vocals",
    violinist: "Violinist",
    admin: "Administrator",

    // Statistics
    stats: "Stats",
    teamStats: "Team Stats",
    teamEngagement: "Team Engagement",
    upcomingEvents: "Upcoming Events",
    bandMembers: "Band Members",
    overallResponseRate: "Overall Response Rate",
    yourResponseRate: "Your Response Rate",
    totalEvents: "Total Events",
    totalMembers: "Total Members",
    totalResponses: "Total Responses",
    responses: "Responses",
    responded: "responded",

    // Events
    events: "Events",
    event: "Event",
    eventTitle: "Event Title",
    eventTitlePlaceholder: "e.g., Sunday Service, Practice, Concert",
    eventDate: "Date",
    eventDescription: "Description",
    eventDescriptionPlaceholder: "Additional details about the event",
    eventType: "Event Type",
    noEvents: "No events scheduled yet",
    noEventsDesc: "Contact your admin to add events",
    addNewEvent: "Add New Event",
    addEventDescription: "Create a new event for the band to respond to",
    descriptionOptional: "Description (Optional)",

    // Event Types
    service: "Service",
    bandOnly: "Band Only",
    jamSession: "Jam Session",
    specialEvent: "Special Event",

    // Coverage
    coverage: "Coverage",
    bandCoverage: "Band Coverage",
    fullyCovered: "Fully Covered",
    availableMembers: "Available Members",
    partiallyCovered: "Partially Covered",
    notCovered: "Not Covered",
    coverageScore: "Coverage Score",
    required: "required",
    jamSessionEncouragement: "More musicians welcome for an even better jam!",
    specialGuestPerformance: "Special Guest Performance",
    willJoinOnViolin: "will join us on violin!",

    // Changes and Actions
    pendingChanges: "Pending Changes",
    unsavedChanges: "unsaved changes",
    unsavedChange: "unsaved change",
    unsavedChangesDescription:
      "Changes are saved locally - submit to save to server",
    changesLocal: "Changes are saved locally - submit to save to server",
    submitChanges: "Submit Changes",
    discardChanges: "Discard Changes",
    discardAll: "Discard All",
    submitAllChanges: "Submit All Changes",
    undoAction: "Undo",
    undoAvailable: "Undo Available",
    undoDescription: "Press Ctrl+Z or click to undo",

    // Keyboard Shortcuts
    keyboardShortcuts: "Keyboard Shortcuts",
    shortcuts: "Shortcuts",
    globalShortcuts: "Global shortcuts available throughout the application",
    refreshData: "Refresh data",
    undoLast: "Undo last action",
    saveChanges: "Save changes",
    showHelp: "Show this help",

    // Messages and Feedback
    loadingData: "Loading availability data...",
    loadingAvailabilityData: "Loading availability data...",
    errorLoading: "Error loading data",
    errorLoadingData: "Error loading data",
    tryAgain: "Try Again",
    noResponsesYet: "No responses yet. Be the first to respond!",
    beFirstToRespond: "Be the first to respond!",
    sessionExpired: "Session expired",
    loginFailed: "Login failed",
    addEventSuccess: "Event added successfully",
    addEventFailed: "Failed to add event",
    adding: "Adding...",

    // Dates and Time
    date: "Date",
    today: "Today",
    upcoming: "Upcoming",
    past: "Past",

    // Form Validation
    required_field: "This field is required",
    invalid_date: "Invalid date",
    invalid_email: "Invalid email",

    // Bulk Actions
    bulkActions: "Bulk Actions",
    bulkSetTitle: "Set {state} for Multiple Events",
    bulkSelectEvents: "Select which events to update:",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    selectEvents: "Select Events",
    setForMultiple: "Set for Multiple",
    bulk: "Bulk", // Planning Center Integration
    exportCsv: "Export CSV",
    planningCenter: "Planning Center",
    exportData: "Export Data",

    // Responsive Messages
    excellent: "🎉 Excellent!",
    goodJob: "👍 Good job",
    keepImproving: "📈 Keep improving",
    pleaseRespond: "💬 Please respond more",
  },

  fr: {
    // App Title and Navigation
    appTitle: "Système de Disponibilité du Groupe",
    appSubtitle: "Gérez votre disponibilité pour les événements à venir",
    bandAvailabilitySystem: "Système de Disponibilité du Groupe",
    manageAvailabilityDescription:
      "Gérez votre disponibilité pour les événements à venir",

    // Navigation
    home: "Accueil",
    availability: "Disponibilité",
    statistics: "Statistiques",

    // General UI
    loading: "Chargement",
    error: "Erreur",
    success: "Succès",
    cancel: "Annuler",
    save: "Enregistrer",
    submit: "Soumettre",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    refresh: "Actualiser",
    clear: "Effacer",
    login: "Connexion",
    logout: "Déconnexion",
    language: "Langue",
    adminMode: "Mode Admin",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    close: "Fermer",

    // Admin Section
    adminAccess: "Accès Administrateur",
    adminLogin: "Connexion Admin",
    adminLogout: "Déconnexion Admin",
    adminPassword: "Mot de passe administrateur",
    adminGranted: "Accès Administrateur Accordé",
    adminRequired: "Accès administrateur requis",
    adminExpired: "Session administrateur expirée. Veuillez vous reconnecter.",
    addEvent: "Ajouter un Événement",
    manageEvents: "Connectez-vous pour gérer les événements",
    invalidAdminPassword: "Mot de passe administrateur invalide",
    adminAccessRequired: "Accès administrateur requis",
    adminSessionExpired:
      "Session administrateur expirée. Veuillez vous reconnecter.",
    adminControls: "Contrôles Administrateur",
    failedToAddEvent: "Échec de l'ajout de l'événement",
    loginToManageEvents: "Connectez-vous pour gérer les événements",
    adminAccessGranted: "Accès Administrateur Accordé",
    adminManageDescription:
      "Vous pouvez maintenant gérer les événements et consulter les statistiques",

    // User Selection
    selectName: "Sélectionnez votre nom",
    chooseYourName: "Choisissez votre nom...",
    welcome: "Bienvenue",
    yourName: "Votre Nom",

    // Availability States
    available: "Disponible",
    unavailable: "Indisponible",
    uncertain: "Incertain",
    notResponded: "Pas de Réponse",

    // Availability Actions
    setAvailable: "Définir Disponible",
    setUnavailable: "Définir Indisponible",
    setUncertain: "Définir Incertain",
    bulkAvailable: "Disponible en Masse",
    bulkUnavailable: "Indisponible en Masse",
    bulkUncertain: "Incertain en Masse",
    yourAvailability: "Votre Disponibilité",

    // Team and Roles
    bassist: "Bassiste",
    pianist: "Pianiste",
    drummer: "Batteur",
    lead: "Lead",
    backgroundVocals: "BV",
    violinist: "Violoniste",
    admin: "Administrateur",

    // Statistics
    stats: "Statistiques",
    teamStats: "Stats de l'Équipe",
    teamEngagement: "Engagement de l'Équipe",
    upcomingEvents: "Événements à Venir",
    bandMembers: "Membres du Groupe",
    overallResponseRate: "Taux de Réponse Global",
    yourResponseRate: "Votre Taux de Réponse",
    totalEvents: "Total des Événements",
    totalMembers: "Total des Membres",
    totalResponses: "Total des Réponses",
    responses: "Réponses",
    responded: "ont répondu",

    // Events
    events: "Événements",
    event: "Événement",
    eventTitle: "Titre de l'Événement",
    eventTitlePlaceholder: "ex: Service du Dimanche, Répétition, Concert",
    eventDate: "Date",
    eventDescription: "Description",
    eventDescriptionPlaceholder: "Détails supplémentaires sur l'événement",
    eventType: "Type d'Événement",
    noEvents: "Aucun événement programmé",
    noEventsDesc: "Contactez votre administrateur pour ajouter des événements",
    addNewEvent: "Ajouter un Nouvel Événement",
    addEventDescription:
      "Créer un nouvel événement pour que le groupe puisse répondre",
    descriptionOptional: "Description (Optionnelle)",

    // Event Types
    service: "Service",
    bandOnly: "Band Seulement",
    jamSession: "Session Jam",
    specialEvent: "Événement Spécial",

    // Coverage
    coverage: "Couverture",
    bandCoverage: "Couverture du Groupe",
    fullyCovered: "Full Band",
    availableMembers: "Membres Disponibles",
    partiallyCovered: "Partiellement Couvert",
    notCovered: "Non Couvert",
    coverageScore: "Score de Couverture",
    required: "requis",
    jamSessionEncouragement:
      "Plus de musiciens sont les bienvenus pour un jam encore meilleur !",
    specialGuestPerformance: "Performance d'Invité Spécial",
    willJoinOnViolin: "nous rejoindra au violon !",

    // Changes and Actions
    pendingChanges: "Modifications en Attente",
    unsavedChanges: "modifications non sauvegardées",
    unsavedChange: "modification non sauvegardée",
    unsavedChangesDescription:
      "Les modifications sont sauvegardées localement - soumettez pour sauvegarder sur le serveur",
    changesLocal:
      "Les modifications sont sauvegardées localement - soumettez pour sauvegarder sur le serveur",
    submitChanges: "Soumettre les Modifications",
    discardChanges: "Ignorer les Modifications",
    discardAll: "Ignorer Tout",
    submitAllChanges: "Soumettre Tout",
    undoAction: "Annuler",
    undoAvailable: "Annulation Disponible",
    undoDescription: "Appuyez sur Ctrl+Z ou cliquez pour annuler",

    // Keyboard Shortcuts
    keyboardShortcuts: "Raccourcis Clavier",
    shortcuts: "Raccourcis",
    globalShortcuts: "Raccourcis globaux disponibles dans toute l'application",
    refreshData: "Actualiser les données",
    undoLast: "Annuler la dernière action",
    saveChanges: "Sauvegarder les modifications",
    showHelp: "Afficher cette aide",

    // Messages and Feedback
    loadingData: "Chargement des données de disponibilité...",
    loadingAvailabilityData: "Chargement des données de disponibilité...",
    errorLoading: "Erreur lors du chargement des données",
    errorLoadingData: "Erreur lors du chargement des données",
    tryAgain: "Réessayer",
    noResponsesYet:
      "Aucune réponse pour le moment. Soyez le premier à répondre !",
    beFirstToRespond: "Soyez le premier à répondre !",
    sessionExpired: "Session expirée",
    loginFailed: "Échec de la connexion",
    addEventSuccess: "Événement ajouté avec succès",
    addEventFailed: "Échec de l'ajout de l'événement",
    adding: "Ajout en cours...",

    // Dates and Time
    date: "Date",
    today: "Aujourd'hui",
    upcoming: "À venir",
    past: "Passé",

    // Form Validation
    required_field: "Ce champ est requis",
    invalid_date: "Date invalide",
    invalid_email: "Email invalide",

    // Bulk Actions
    bulkActions: "Actions en Masse",
    bulkSetTitle: "Définir {state} pour Plusieurs Événements",
    bulkSelectEvents: "Sélectionnez les événements à mettre à jour :",
    selectAll: "Tout Sélectionner",
    deselectAll: "Tout Désélectionner",
    selectEvents: "Sélectionnez les événements à mettre à jour",
    setForMultiple: "Définir pour Plusieurs Événements",
    bulk: "En Masse",

    // Planning Center Integration
    exportCsv: "Exporter CSV",
    planningCenter: "Planning Center",
    exportData: "Exporter les Données",

    // Responsive Messages
    excellent: "🎉 Excellent !",
    goodJob: "👍 Bon travail",
    keepImproving: "📈 Continuez à vous améliorer",
    pleaseRespond: "💬 Veuillez répondre plus souvent",
  },
};

// Language context and hooks
export function getTranslation(language: Language): Translations {
  return translations[language];
}

// Browser language detection
export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("fr")) {
    return "fr";
  }
  return "en";
}

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = "band_app_language";

// Save language preference
export function saveLanguagePreference(language: Language): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}

// Load language preference
export function loadLanguagePreference(): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved && (saved === "en" || saved === "fr")) {
      return saved;
    }
  }
  return detectBrowserLanguage();
}
