const loginDiv = document.getElementById("login");
const adminPanel = document.getElementById("adminPanel");

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

// Charger les articles
async function loadArticles() {
  const { data: articles, error } = await supabaseClient
    .from("articles")
    .select("*")
    .order("date_publication", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("articles");
  container.innerHTML = "";

  articles.forEach(a => {
    const encodedTitre = encodeURIComponent(a.titre);
    const encodedContenu = encodeURIComponent(a.contenu);

    const articleEl = document.createElement("article");
    articleEl.classList.add("card", "p-3", "shadow", "mb-3");
    articleEl.innerHTML = `
      <h4>${a.titre}</h4>
      <p>${a.contenu}</p>
      <small>Par ${a.auteur ?? "Inconnu"}, le ${new Date(a.date_publication).toLocaleDateString("fr-FR")}</small>
      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-sm btn-primary editBtn">✏️ Éditer</button>
        <button class="btn btn-sm btn-danger deleteBtn">🗑️ Supprimer</button>
      </div>
    `;

    // Éditer
    articleEl.querySelector(".editBtn").addEventListener("click", () => {
      openEditModal(a.id, encodedTitre, encodedContenu);
    });

    // Supprimer
    articleEl.querySelector(".deleteBtn").addEventListener("click", () => {
      openDeleteModal(a.id);
    });

    container.appendChild(articleEl);
  });
}

// Ajouter un article
document.getElementById("ajoutArticle").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titre = e.target.titre.value;
  const contenu = e.target.contenu.value;
  const auteur = e.target.auteur.value;

  const { error } = await supabaseClient
    .from("articles")
    .insert([{ titre, contenu, auteur, date_publication: new Date().toISOString() }]);

  if (error) {
    alert("Erreur : " + error.message);
  } else {
    alert("Article publié !");
    e.target.reset();
    loadArticles();
  }
});

// Fonction pour ouvrir modal édition
function openEditModal(id, encodedTitre, encodedContenu) {
  const form = document.getElementById("editArticleForm");
  document.getElementById("articleId").value = id;
  form.titre.value = decodeURIComponent(encodedTitre);
  form.contenu.value = decodeURIComponent(encodedContenu);

  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();

  document.getElementById("cancelEdit").onclick = () => editModal.hide();
}

// Soumission édition
document.getElementById("editArticleForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("articleId").value;
  const titre = e.target.titre.value;
  const contenu = e.target.contenu.value;

  try {
    const { error } = await supabaseClient
      .from("articles")
      .update({ titre, contenu })
      .eq("id", id);

    if (error) throw error;

    const editModalEl = document.getElementById("editModal");
    bootstrap.Modal.getInstance(editModalEl).hide();
    loadArticles();
  } catch (err) {
    alert("Erreur : " + err.message);
  }
});

// Gestion suppression
let articleToDelete = null;

function openDeleteModal(id) {
  articleToDelete = id;
  const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
  deleteModal.show();

  document.getElementById("cancelDelete").onclick = () => {
    deleteModal.hide();
    articleToDelete = null;
  };
}

document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (!articleToDelete) return;

  try {
    const { error } = await supabaseClient
      .from("articles")
      .delete()
      .eq("id", articleToDelete);

    if (error) throw error;

    const deleteModalEl = document.getElementById("deleteModal");
    bootstrap.Modal.getInstance(deleteModalEl).hide();
    articleToDelete = null;

    alert("Article supprimé ✅");
    loadArticles();
  } catch (err) {
    alert("Erreur : " + err.message);
  }
});

// Affiche panneau admin après login
function showAdminPanel() {
  loginDiv.style.display = "none";
  adminPanel.style.display = "block";
  loadArticles();
}

// Affiche login
function showLogin() {
  loginDiv.style.display = "block";
  adminPanel.style.display = "none";
}
