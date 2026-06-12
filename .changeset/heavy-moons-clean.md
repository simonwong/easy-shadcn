---
"@easy-shadcn/command-modal": minor
---

Export `unregister` from the package entry. Dynamically created modals (e.g. promise-style alert/confirm helpers built on `create()` + `show()`) can now remove their `MODAL_REGISTRY` entry after settling, instead of leaking one registry entry per call.
