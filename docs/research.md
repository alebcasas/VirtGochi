# Investigación base: Tamagotchi original (resumen aplicable a VirtGochi)

Fuentes consultadas:
- Sitio oficial Tamagotchi Original (Bandai): https://tamagotchi-official.com/es/series/original/
- Página de marca Bandai Tamagotchi: https://www.bandai.com/brands/tamagotchi

## Mecánicas clave del juego clásico (para emular en MVP)
1. **Ciclo de vida**: huevo -> bebé -> niño -> adolescente -> adulto.
2. **Necesidades periódicas**: hambre, felicidad, higiene y descanso bajan con el tiempo.
3. **Disciplina/entrenamiento**: influye en el comportamiento y evolución.
4. **Enfermedad/caca**: mala atención incrementa riesgo de enfermedad.
5. **Sueño**: horarios de sueño y acción de apagar luz.
6. **Muerte/fin de ciclo**: descuido prolongado termina la partida.
7. **Minijuego simple**: subir felicidad.
8. **Sonidos/alertas**: avisos cuando necesita cuidados.

## Traducción a Telegram
- Alertas por mensaje del bot cuando algún stat cae debajo de umbral.
- Render retro y animaciones por frames en Web App (Canvas).
- Acciones por botones inline y por pantalla principal de la Web App.

## Consideración UX
Para parecerse al Tamagotchi original, la parte visual debe vivir en Web App, no solo en chat.
