const DATA_PATH = "/assets/data/";

async function fetchData(filename) {
    const response = await fetch(DATA_PATH + filename);
    if (!response.ok) {
        throw new Error(`Could not load ${filename}`);
    }
    return response.json();
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function createImage(src, alt = "") {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";
    return image;
}

function initializePartners(images) {
    const track = document.getElementById("partners-track");
    if (!track) return;
    track.replaceChildren();
    if (!images.length) {
        track.closest(".partners-section").hidden = true;
        return;
    }
    for (let copy = 0; copy < 2; copy++) {
        const group = createElement("div", "partners-group");
        if (copy === 1) {
            group.setAttribute("aria-hidden", "true");
        }
        images.forEach(src => {
            const filename = decodeURIComponent(
                src.split("/").pop()
            );
            const name = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
            const item = createElement("div", "partner-item");
            const image = createImage(src, copy === 0 ? name : "");
            image.loading = "eager";
            item.appendChild(image);
            group.appendChild(item);
        });
        track.appendChild(group);
    }
}

function initializeCollages(manifest) {
    initializeCollages.forEach(collage => {
        const folder = collage.dataset.collage;
        const images = manifest[folder] || [];
        collage.replaceChildren();
        if (!images.length) return;
        const rowCount = 3;
        const minimumImages = 18;
        const totalImages = Math.max(minimumImages, images.length);
        const tiles = Array.from({ length: totalImages }, (_, index) => images[index % images.length]);
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            const row = createElement("div", "collage-row");
            row.classList.add(rowIndex % 2 === 0 ? "collage-forward" : "collage-reverse");
            const rowImages = tiles.filter((_, index) => index % rowCount === rowIndex);
            for (let copy = 0; copy < 2; copy++) {
                const group = createElement("div", "collage-group");
                rowImages.forEach(src => {
                    const tile = createElement("div", "collage-tile");
                    const image = createImage(src);
                    tile.appendChild(image);
                    group.appendChild(tile);
                });
                row.appendChild(group);
            }
            collage.appendChild(row);
        }
    });
}

function getLatestEntries(entries, limit = 3) {
    return [...entries].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    }).slice(0, limit);
}

function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
}

function renderProjects(projects) {
    const container = document.getElementById("latest-projects");
    if (!container) return;
    container.replaceChildren();
    const latestProject = getLatestEntries(projects, 3);
    if (!latestProjects.length) {
        container.appendChild(createElement("p", "empty-message", "New Projects Coming Soon..."));
        return;
    }
    latestProjects.forEach(project => {
        const card = createElement("article", "project-card");
        const preview = createElement("div", "project-preview");
        const image = createImage(project.image || "assets/img/logo.png", project.title);
        preview.appendChild(image);
        const content = createElement("div", "project-content");
        const tags = createElement("div", "project-tags");
        (project.tags || []).forEach(tag => {
            tags.appendChild(
                createElement("span", "tag", tag)
            );
        });
        const title = createElement("h3", "", project.title);
        const description = createElement("p", "", project.description);
        const author = createElement("span", "project-author", "By " + project.author);
        const date = createElement("time", "project-date", formatDate(project.date));
        date.dateTime = project.date;
        const link = createElement("a", "text-link", "View Project ↗");
        link.href = project.url || "/projects/";
        content.append(tags, title, description, author, date, link);
        card.append(preview, content);
        container.appendChild(card);
    });
}

function renderNews(news) {
    const container = document.getElementById("latest-news");
    if (!container) return;
    container.replaceChildren();
    const latestNews = getLatestEntries(news, 3);
    if (!latestNews.length) {
        container.appendChild(createElement("p", "empty-message", "No news yet. Stay tuned!"));
        return;
    }
    latestNews.forEach(article => {
        const card = createElement("article", "news-card");
        const preview = createElement("div", "news-preview");
        preview.appendChild(
            createImage(article.image || "/assets/img/logo.png", article.title)
        );
        const content = createElement("div", "news-content");
        const meta = createElement("div", "news-meta");
        const category = createElement("span", "news-category", article.category);
        const date = createElement("time", "news-date", formatDate(article.date));
        date.dateTime = article.date;
        meta.append(category, date);
        const title = createElement("h3", "", article.title);
        const description = createElement("p", "", article.description);
        const link = createElement("a", "text-link", "Read more →");
        link.href = article.url || "/news/";
        content.append(meta, title, description, link);
        card.append(preview, content);
        container.appendChild(card);
    });
}

function renderAchievements(achievements) {
    const counter = document.getElementById("achievement-count");
    if (!counter) return;
    counter.textContent = achievements.length;
}

function initializeNavigation() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("active");
        toggle.classList.toggle("active", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    });
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            toggle.classList.remove("active");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

async function initializeWebsite() {
    initializeNavigation();
    const tasks = [];
    if (document.getElementById("partners-track") || document.querySelector("[data-collage]")) {
        tasks.push(fetchData("images.json").then(manifest => {
            initializePartners(manifest.partners || []);
            initializeCollages(manifest);
        }));
    }
    if (document.getElementById("latest-projects")) {
        tasks.push(fetchData("projects.json").then(renderProjects).catch(error => {
            const container = document.getElementById("latest-projects");
            container.textContent = "Projects are currently unavailable.";
            console.error(error);
        }));
    }
    if (document.getElementById("latest-news")) {
        tasks.push(fetchData("news.json").then(renderNews).catch(error => {
            const container = document.getElementById("latest-news");
            container.textContent = "News is currently unavailable.";
            console.error(error);
        }));
    }
    if (document.getElementById("achievement-count")) {
        tasks.push(fetchData("achievements.json").then(renderAchievements));
    }
    const results = await Promise.allSettled(tasks);
    results.forEach(result => {
        if (result.status === "rejected") {
            console.error("[CSC Tech]", result.reason);
        }
    });
}

document.addEventListener("DOMContentLoaded", initializeWebsite);