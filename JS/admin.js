const SUPABASE_URL = "https://ohqgbojfjjowjayycpph.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocWdib2pmampvd2pheXljcHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODk5NzQsImV4cCI6MjA3MTk2NTk3NH0.9Av1dlKszmkrX3z81m3pAB4fZARXH0PcxG_TLSXfsK8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginDiv = document.getElementById("login");
const adminPanel = document.getElementById("adminPanel");

// Vérifie si l'utilisateur est déjà connecté
supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) {
    showAdminPanel();
  }
});

// Connexion
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Erreur de connexion : " + error.message);
  } else {
    showAdminPanel();
  }
});

// Ajout d'article
document.getElementById("ajoutArticle").addEventListener("submit", async (e) => {
  e.preventDefault();

  const titre = e.target.titre.value;
  const contenu = e.target.contenu.value;
  const auteur = e.target.auteur.value;

  const { error } = await supabaseClient
    .from("articles")
    .insert([{ titre, contenu, auteur }]);

  if (error) {
    alert("Erreur : " + error.message);
  } else {
    alert("Article publié !");
    e.target.reset();
  }
});

// Déconnexion
document.getElementById("logout").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

async function getUserRole() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabaseClient
    .from("profils")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data.role;
}

async function initAdminPanel() {
  const role = await getUserRole();

  if (role === "auteur") {
    document.getElementById("ajoutArticle").style.display = "block";
  }

  if (role === "editeur" || role === "admin") {
    // Ici tu pourrais aussi afficher une section pour éditer les articles
    console.log("Éditeur/Admin → peut modifier les articles");
  }

  if (role === "admin") {
    // Ici tu pourrais afficher un bouton pour supprimer des articles
    console.log("Admin → peut supprimer des articles");
  }
}


// Fonctions utilitaires
async function showAdminPanel() {
  loginDiv.style.display = "none";
  adminPanel.style.display = "block";
  await initAdminPanel();
}


function showLogin() {
  loginDiv.style.display = "block";
  adminPanel.style.display = "none";
}
