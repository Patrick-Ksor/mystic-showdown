# Sound Assets

Place audio files here to replace the procedural synthesised sounds.
Both `.ogg` (preferred, smaller) and `.mp3` (fallback) are supported.
If a file is missing the game automatically falls back to procedural synthesis,
so partial installs work fine.

---

## Directory layout

```
sounds/
  elements/   ← one file per element type (13 files)
  combat/     ← hit, crit, miss, faint (5 files)
```

---

## elements/

| File           | Element  | Sound character                          |
| -------------- | -------- | ---------------------------------------- |
| `fire.ogg`     | fire     | Roaring flame burst / crackling ignition |
| `water.ogg`    | water    | Rushing water splash / liquid impact     |
| `electric.ogg` | electric | Lightning crack / electric zap           |
| `earth.ogg`    | earth    | Deep rumble / ground slam                |
| `ice.ogg`      | ice      | Crystal shattering / icy chime           |
| `shadow.ogg`   | shadow   | Dark whoosh / eerie drone                |
| `wind.ogg`     | wind     | Rushing wind gust / air swoosh           |
| `nature.ogg`   | nature   | Rustling leaves / organic swish          |
| `psychic.ogg`  | psychic  | High-pitched warble / psionic pulse      |
| `metal.ogg`    | metal    | Metallic clang / steel ring              |
| `light.ogg`    | light    | Bright shimmer / celestial chime         |
| `toxic.ogg`    | toxic    | Bubbling hiss / corrosive splatter       |
| `void.ogg`     | void     | Deep void resonance / dimensional tear   |

---

## combat/

| File               | Trigger                | Sound character                      |
| ------------------ | ---------------------- | ------------------------------------ |
| `hit-physical.ogg` | Physical move connects | Heavy thud / punch impact            |
| `hit-special.ogg`  | Special move connects  | Magical energy burst / arcane impact |
| `crit.ogg`         | Critical hit           | Extra-sharp crack with a ring-out    |
| `miss.ogg`         | Attack misses          | Whoosh fading out                    |
| `faint.ogg`        | Monster faints         | Descending wail / defeated groan     |

---

## Recommended free sources

- **Kenney.nl** — `Interface Sounds`, `Impact Sounds`, `RPG Audio`
  (CC0 / public domain, no attribution required)
- **Freesound.org** — search by element name; filter by CC0 or CC-BY
- **OpenGameArt.org** — search "RPG sound effects"

> Tip: normalise all files to −3 dBFS peak and trim silence so they play crisply.
