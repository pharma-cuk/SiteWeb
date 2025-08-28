// Remplace par tes valeurs Supabase
const SUPABASE_URL = "https://ohqgbojfjjowjayycpph.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocWdib2pmampvd2pheXljcHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODk5NzQsImV4cCI6MjA3MTk2NTk3NH0.9Av1dlKszmkrX3z81m3pAB4fZARXH0PcxG_TLSXfsK8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function chargerArticles() {
  const { data: articles, error } = await supabaseClient
  .from("articles")
  .select("*")
  .order("date_publication", { ascending: false })
  .limit(6);


  if (error) {
    console.error("Erreur lors du chargement des articles :", error);
    return;
  }

  const container = document.getElementById("articles");
  if (!container) return;

  if (!articles || articles.length === 0) {
    container.innerHTML = `<p>Aucun article pour le moment.</p>`;
    return;
  }

  container.innerHTML = articles
    .map(
      (a) => `
        <div class="col-12 col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title c-actualite">${a.titre}</h5>
              <p class="card-text c-actualite">${a.contenu.substring(0, 100)}...</p>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${a.id}">
                Lire plus
                </button>

                <!-- Modal -->
                <div class="modal fade" id="modal-${a.id}" tabindex="-1" aria-labelledby="modalLabel-${a.id}" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalLabel-${a.id}">${a.titre}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        ${a.contenu}
                    </div>
                    </div>
                </div>
                </div>
                Publié le ${new Date(a.date_publication).toLocaleDateString()} par ${a.auteur ?? "Inconnu"}
              </small>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

chargerArticles();
