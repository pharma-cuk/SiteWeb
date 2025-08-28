const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "ton_anon_key";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginDiv = document.getElementById("login");
const adminPanel = document.getElementById("adminPanel");
const userRoleSpan = document.getElementById("userRole");

// Vérifie la session existante
supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) showAdminPanel();
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

// Déconnexion
document.getElementById("logout").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

// Récupère le rôle de l'utilisateur
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

// Affiche les articles avec actions selon rôle
async function loadArticles(role) {
  const { data: articles, error } = await supabaseClient
    .from("articles")
    .select("*")
    .order("date_publication", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("articles");
  container.innerHTML = articles.map(a => `
    <article>
      <h4>${a.titre}</h4>
      <p>${a.contenu}</p>
      <small>Par ${a.auteur ?? "Inconnu"}, le ${new Date(a.date_publication).toLocaleDateString()}</small>
      ${role === "editeur" || role === "admin" ? `<button onclick="editArticle('${a.id}','${a.titre}','${a.contenu}')">✏️ Éditer</button>` : ""}
      ${role === "admin" ? `<button onclick="deleteArticle('${a.id}')">🗑️ Supprimer</button>` : ""}
    </article>
  `).join("");
}

// Ajouter un article
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
    const role = await getUserRole();
    loadArticles(role);
  }
});

// Éditer un article
window.editArticle = async (id, oldTitre, oldContenu) => {
  const newTitre = prompt("Nouveau titre :", oldTitre);
  const newContenu = prompt("Nouveau contenu :", oldContenu);

  if (!newTitre || !newContenu) return;

  const { error } = await supabaseClient
    .from("articles")
    .update({ titre: newTitre, contenu: newContenu })
    .eq("id", id);

  if (error) {
    alert("Erreur : " + error.message);
  } else {
    alert("Article mis à jour !");
    const role = await getUserRole();
    loadArticles(role);
  }
};

// Supprimer un article
window.deleteArticle = async (id) => {
  if (!confirm("Voulez-vous vraiment supprimer cet article ?")) return;

  const { error } = await supabaseClient
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erreur : " + error.message);
  } else {
    alert("Article supprimé !");
    const role = await getUserRole();
    loadArticles(role);
  }
};

// Afficher panneau admin après login
async function showAdminPanel() {
  loginDiv.style.display = "none";
  adminPanel.style.display = "block";

  const role = await getUserRole();
  userRoleSpan.textContent = role;

  if (["auteur","editeur","admin"].includes(role)) {
    document.getElementById("addSection").style.display = "block";
  }

  loadArticles(role);
  if (role === "admin") {
    document.getElementById("userManagement").style.display = "block";
    loadUsers();
  }
}

// Afficher login
function showLogin() {
  loginDiv.style.display = "block";
  adminPanel.style.display = "none";
}
// Charger les utilisateurs avec leurs rôles
async function loadUsers() {
  const { data: users, error } = await supabaseClient
    .from("profils")
    .select("id, role");

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("users");
  container.innerHTML = users.map(u => `
    <div>
      <strong>${u.id}</strong> 
      - Rôle actuel : ${u.role}
      <select onchange="updateUserRole('${u.id}', this.value)">
        <option value="auteur" ${u.role === "auteur" ? "selected" : ""}>Auteur</option>
        <option value="editeur" ${u.role === "editeur" ? "selected" : ""}>Éditeur</option>
        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
      </select>
    </div>
  `).join("");
}

// Mettre à jour le rôle d’un utilisateur
window.updateUserRole = async (userId, newRole) => {
  const { error } = await supabase
    .from("profils")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    alert("Erreur : " + error.message);
  } else {
    alert("Rôle mis à jour !");
    loadUsers();
  }
};
