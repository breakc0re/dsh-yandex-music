# Скриншоты

PNG в этой папке отрендерены из настоящей таблицы стилей плагина (`client.js`,
блок `CSS`) и настоящих данных каталога станций из
`plugin-data/dsh-yandex-music/cache/stations.json`. Обложки, аватар исполнителя
и иконки станций — реальные картинки Яндекс Музыки, подгруженные по своим
ссылкам.

Полоса длительности оставлена «нативной» (`accent-color`), поэтому синяя часть
до ползунка рисуется так же, как в приложении, — подмены стилей слайдера нет.

## Как пересобрать

1. Вырезать блок `CSS` из `client.js` в файл `.preview/plugin.css` и добавить
   сверху палитру `--dsw-alias-*` (иначе переменные темы не определены).
2. Собрать страницы в `.preview/`: `main.html` (очередь), `wave.html` (станции),
   `lyrics.html` (окно текста), `hero.html` (попап и текст рядом).
3. Снять скриншоты headless Chrome в 2×:

```powershell
chrome --headless=new --disable-gpu --hide-scrollbars `
  --force-device-scale-factor=2 --virtual-time-budget=9000 `
  --window-size=760,760 --screenshot=docs/screenshots/main.png `
  "file:///.../docs/screenshots/.preview/main.html"
```

Каталог `.preview/` в git не хранится — это рабочие файлы.
