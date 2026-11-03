// Discover the actual local filenames, including their case and extensions.
// Public covers are visual references only, not a list of included games.
const files = Object.keys(
  import.meta.glob(
    "/public/juegos/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG,WEBP,AVIF}",
    { eager: true, query: "?url", import: "default" },
  ),
);
const optimized = Object.keys(
  import.meta.glob("/public/juegos/optimized/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
);
const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const assetUrl = (file) =>
  file.replace("/public/", "/").split("/").map(encodeURIComponent).join("/");

export const games = [
  [
    "Mario Kart: Super Circuit",
    "Carreras",
    /mario.*kart|super.*circuit|^supermario\./,
  ],
  ["Super Mario Land 2", "Plataformas", /mario.*land/],
  ["The Legend of Zelda: The Minish Cap", "Aventura", /zelda|minish/],
  ["Tetris", "Puzzle", /tetris/],
  ["Pac-Man", "Arcade", /pac[\s_-]*man/],
  ["Pokémon Esmeralda", "RPG", /pokemon|esmeralda|emerald/],
].map(([name, genre, match]) => {
  const file = files.find((path) =>
    match.test(normalize(path.split("/").pop())),
  );
  const compressed =
    file &&
    optimized.find(
      (path) => path.split("/").pop() === `${file.split("/").pop()}.webp`,
    );
  return {
    name,
    genre,
    cover: file ? assetUrl(file) : null,
    optimizedCover: compressed ? assetUrl(compressed) : null,
  };
});
