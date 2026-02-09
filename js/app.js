const appState = {
  users: [],
  search: "",
  onlyFavorites: false,
  sort: "asc",
  activeIndex: -1,
};

// Favoriten im LocalStorage speichern (stabil über E-Mail)
function saveFavorites() {
  const favEmails = appState.users
    .filter((u) => u.isFavorite)
    .map((u) => u.email);

  localStorage.setItem("favorites", JSON.stringify(favEmails));
}

// Favoriten aus dem LocalStorage laden
function loadFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

// User aus der XML-Datei laden
function loadUsers() {
  $.ajax({
    url: "data/users.xml",
    dataType: "xml",
    success(xml) {
      const favEmails = loadFavorites();

      $(xml)
        .find("user")
        .each(function () {
          const email = $(this).find("email").text().trim();

          appState.users.push({
            name: $(this).find("name").text().trim(),
            email: email,
            isFavorite: favEmails.includes(email),
          });
        });
    },
  });
}

// Gefilterte und sortierte User zurückgeben
function getVisibleUsers() {
  return appState.users
    .filter(
      (u) =>
        (!appState.onlyFavorites || u.isFavorite) &&
        (appState.search === "" ||
          u.name.toLowerCase().includes(appState.search))
    )
    .slice() // Kopie erstellen, um den State nicht zu verändern
    .sort((a, b) =>
      appState.sort === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
}

// User Cards rendern
function renderUsers() {
  const users = getVisibleUsers();
  const $out = $("#output").empty();

  if (users.length === 0) {
    $out.append(`
      <div class="text-center text-muted mt-4">
        <p class="mb-1">🔍 Keine Benutzer gefunden</p>
        <small>Versuche einen anderen Namen</small>
      </div>
    `);
    return;
  }

  users.forEach((u) => {
    $out.append(`
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">${u.name}</h5>
              <p class="mb-0 text-muted">${u.email}</p>
            </div>
            <button
              class="favorite-btn"
              data-email="${u.email}">
              ${u.isFavorite ? "★" : "☆"}
            </button>
          </div>
        </div>
      </div>
    `);
  });
}

// Autocomplete-Vorschläge anzeigen
function renderSuggestions() {
  const value = appState.search;
  const $box = $("#suggestions").empty();
  appState.activeIndex = -1;

  if (!value) {
    $box.hide();
    return;
  }

  const matches = appState.users
    .filter((u) => u.name.toLowerCase().includes(value))
    .slice(0, 5);

  if (matches.length === 0) {
    $box.append(`<div class="list-group-item text-muted">Keine Treffer</div>`);
    $box.show();
    return;
  }

  matches.forEach((u) => {
    $box.append(`
      <button
        class="list-group-item list-group-item-action autocomplete-item"
        data-name="${u.name}">
        ${u.name}
      </button>
    `);
  });

  $box.show();
}

// Tippen im Suchfeld → Autocomplete
$("#search").on("keyup", function (e) {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) return;
  appState.search = this.value.trim().toLowerCase();
  renderSuggestions();
});

// Tastatur-Navigation und Enter
$("#search").on("keydown", function (e) {
  const items = $("#suggestions .autocomplete-item");

  if (e.key === "Enter") {
    e.preventDefault();

    if (appState.activeIndex >= 0 && items.length) {
      items.eq(appState.activeIndex).click();
      return;
    }

    renderUsers();
    $("#suggestions").hide();
  }

  if (!items.length) return;

  if (e.key === "ArrowDown") {
    appState.activeIndex = (appState.activeIndex + 1) % items.length;
  }

  if (e.key === "ArrowUp") {
    appState.activeIndex =
      (appState.activeIndex - 1 + items.length) % items.length;
  }

  items.removeClass("active");
  items.eq(appState.activeIndex).addClass("active");
});

// Klick auf einen Autocomplete-Vorschlag
$(document).on("click", ".autocomplete-item", function () {
  const name = $(this).data("name");
  $("#search").val(name);
  appState.search = name.toLowerCase();
  renderUsers();
  $("#suggestions").hide();
});

// Favorit setzen oder entfernen
$(document).on("click", ".favorite-btn", function () {
  const email = $(this).attr("data-email");

  const user = appState.users.find((u) => u.email === email);
  if (!user) return;

  user.isFavorite = !user.isFavorite;

  saveFavorites();
  renderUsers();
});

// Filter „Nur Favoriten“
$("#filterFavorites").on("change", function () {
  appState.onlyFavorites = this.checked;
  renderUsers();
});

// Sortierung ändern
$("#sortUsers").on("change", function () {
  appState.sort = this.value;
  renderUsers();
});

// Initiale Initialisierung
$(document).ready(function () {
  loadUsers();
});
