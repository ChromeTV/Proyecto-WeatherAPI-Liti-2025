# Proyecto-WeatherAPI-Liti-2025
Repositiorio del proyecto de pagina con uso de WeatherAPI para evaluacion en programacion web LiTI2025

Ejemplo en [Netlify](https://frabjous-pithivier-438fa0.netlify.app)

Funciones:
Actualmente carga la pagina en un unico index con tres secciones:
- Titulo.
- Input para Lista de ciudades con buscador.
- Y resultados donde se subdivide en tres:
  - Resultado principal, que es el clima detallado el dia actual.
  - Grid adaptable para PC e celular con el pronostico proximo de tres dias (la version de celular puede ir a baja tasa de fotogramas por limitaciones de navegadores).
  - Al pulsar uno de los dias pronosticados del Grid, una tarjeta inferior se expande para mostar mas detalles.
 
Ademas del uso de [WeatherAPI](https://www.weatherapi.com), para el fetch de busqueda en JSON dentro de un mismo script se hizo uso de la API de [Select2](https://select2.org) para 
el formulario de busqueda, filtrando automaticamente la ciudad, region y pais y guardando el resultado en el localStorage al recargar la pagina, junto a un boton para restablecer
la busqueda de la pagina al estado inicial.

Proyecto Realizado Por Adrian A. Cazarez Villa de la UABCS por motivos academicos en la carrera de LiTI2025, el uso del material en el repositorio para fines mas alla de educativos o
de uso personal se encuentra prohibido bajo mi autoria.
-A.
