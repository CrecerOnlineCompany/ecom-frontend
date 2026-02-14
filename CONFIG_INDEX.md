# 📖 Índice de Documentación de Configuración

## 🚀 Para Empezar

Si es tu primera vez usando el sistema de configuración, empieza por aquí:

1. **[QUICK_CONFIG.md](./QUICK_CONFIG.md)** ⚡
   - Guía rápida con ejemplos prácticos
   - Cambios más comunes
   - Copiar y pegar directo
   - **Recomendado para empezar**

2. **[CONFIG_README.md](./CONFIG_README.md)** 📋
   - Resumen del sistema
   - Características principales
   - Ejemplos de uso básico

## 📚 Documentación Detallada

3. **[CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** 📖
   - Guía completa y detallada
   - Todas las opciones disponibles
   - Funciones helper
   - Mejores prácticas

## 🎨 Recursos Adicionales

4. **[src/config/appConfig.js](./src/config/appConfig.js)** ⚙️
   - Archivo principal de configuración
   - **Aquí haces todos los cambios**

5. **[src/config/themePresets.js](./src/config/themePresets.js)** 🎭
   - Temas predefinidos listos para usar
   - 6 temas diferentes incluidos

6. **[src/components/ConfigDemo.vue](./src/components/ConfigDemo.vue)** 🧪
   - Componente de demostración visual
   - Ver configuración en acción

## 🎯 ¿Qué Necesitas Hacer?

### Cambiar Colores
→ [QUICK_CONFIG.md - Sección "Temas Rápidos"](./QUICK_CONFIG.md#-temas-rápidos)

### Configurar Estrellas en Rating
→ [QUICK_CONFIG.md - Sección "Formatos de Rating"](./QUICK_CONFIG.md#-formatos-de-rating)

### Mostrar/Ocultar Elementos
→ [QUICK_CONFIG.md - Sección "Cambios Más Comunes"](./QUICK_CONFIG.md#-cambios-más-comunes)

### Ver Todas las Opciones
→ [CONFIG_GUIDE.md](./CONFIG_GUIDE.md)

### Usar un Tema Predefinido
→ [src/config/themePresets.js](./src/config/themePresets.js)

## 📁 Estructura de Archivos

```
cinea-frontend/
├── CONFIG_README.md          # Resumen del sistema
├── CONFIG_GUIDE.md           # Guía completa
├── QUICK_CONFIG.md           # Guía rápida ⭐
├── CONFIG_INDEX.md           # Este archivo
│
├── src/
│   ├── config/
│   │   ├── appConfig.js      # ⚙️ Configuración principal
│   │   └── themePresets.js   # 🎭 Temas predefinidos
│   │
│   ├── composables/
│   │   └── useAppConfig.js   # Hook para componentes
│   │
│   ├── plugins/
│   │   └── configPlugin.js   # Plugin Vue
│   │
│   └── components/
│       ├── ConfigDemo.vue    # Demo visual
│       └── MovieCard.vue     # Ejemplo de uso
│
└── ...
```

## 🎓 Tutoriales Paso a Paso

### Tutorial 1: Cambiar el Color Principal
1. Abre `/src/config/appConfig.js`
2. Busca `colors: { primary: '#667eea'`
3. Cambia `#667eea` por tu color preferido
4. Guarda (Ctrl+S)
5. ¡Listo!

### Tutorial 2: Activar Descripciones en MovieCard
1. Abre `/src/config/appConfig.js`
2. Busca `movieCard: {`
3. Encuentra `showDescription: false`
4. Cambia a `showDescription: true`
5. Guarda
6. ¡Las descripciones ahora se muestran!

### Tutorial 3: Usar un Tema Predefinido
1. Abre `/src/config/themePresets.js`
2. Copia el tema que te guste (ej: `themeNetflix`)
3. Abre `/src/config/appConfig.js`
4. Reemplaza los colores con los del tema
5. Guarda
6. ¡Nuevo tema aplicado!

## ❓ Preguntas Frecuentes

**P: ¿Necesito reiniciar el servidor?**  
R: No, los cambios se aplican automáticamente al guardar.

**P: ¿Puedo romper algo si modifico appConfig.js?**  
R: No, siempre puedes revertir los cambios. Haz una copia de seguridad primero.

**P: ¿Cómo veo los cambios en acción?**  
R: Importa `ConfigDemo.vue` en cualquier vista para ver una demo visual.

**P: ¿Dónde encuentro los colores en formato hexadecimal?**  
R: Usa herramientas como [Coolors.co](https://coolors.co) o [Adobe Color](https://color.adobe.com)

**P: ¿Puedo crear mi propio tema?**  
R: Sí, simplemente edita los colores en `appConfig.js` o crea uno nuevo en `themePresets.js`

## 🆘 Solución de Problemas

**Problema**: Los cambios no se reflejan  
**Solución**: 
- Asegúrate de guardar el archivo
- Recarga la página (F5)
- Verifica que no haya errores de sintaxis

**Problema**: Error de sintaxis  
**Solución**: 
- Verifica que los colores tengan comillas: `'#667eea'`
- Asegúrate de que true/false estén en minúsculas
- Revisa que no falten comas

**Problema**: No sé qué valor poner  
**Solución**: 
- Consulta [QUICK_CONFIG.md](./QUICK_CONFIG.md) para ejemplos
- Revisa [themePresets.js](./src/config/themePresets.js) para ideas

## 💡 Tips Profesionales

1. **Haz backups**: Copia `appConfig.js` antes de hacer cambios grandes
2. **Cambia de a poco**: Modifica un valor a la vez para ver el efecto
3. **Usa presets**: Los temas predefinidos son un buen punto de partida
4. **Documenta cambios**: Añade comentarios en el código
5. **Prueba en móvil**: Verifica que se vea bien en todos los dispositivos

## 🔗 Links Rápidos

- [Editar Configuración Principal](./src/config/appConfig.js)
- [Ver Temas Predefinidos](./src/config/themePresets.js)
- [Guía Rápida](./QUICK_CONFIG.md)
- [Guía Completa](./CONFIG_GUIDE.md)

## 📝 Notas

- Este sistema está diseñado para ser simple y fácil de usar
- No necesitas conocimientos avanzados de Vue.js
- Todos los cambios son reversibles
- La documentación está en español para facilitar su uso

---

**¿Por dónde empezar?** → [QUICK_CONFIG.md](./QUICK_CONFIG.md) ⚡

**¿Necesitas ayuda?** → Consulta [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) 📖
