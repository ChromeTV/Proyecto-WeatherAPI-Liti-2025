const API_KEY = "cae9b15f1c134253a4d222748252511"; 
const $select = $("#city-select");
const $result = $("#weather-result");
const $btn = $("#get-weather-btn");


// keys para localStorage
const LAST_KEY = "weather_last_id";          
const LAST_LABEL_KEY = "weather_last_label";
const LAST_DAY_CITY_KEY = "weather_last_day_city";
const LAST_DAY_INDEX_KEY = "weather_last_day_index";

// Select2 configuracion
$select.select2({
    placeholder: "Busca una ciudad",
    width: 'resolve',
    dropdownParent: $('body'),
    minimumInputLength: 4,
    ajax: {
        url: "https://api.weatherapi.com/v1/search.json",
        dataType: "json",
        delay: 100,
        data: function(params) {
            return {
                key: API_KEY,
                q: params.term
            };
        },
        processResults: function(data) {
            return {
                results: data.map(city => ({
                    id: `${city.name}|${city.region}|${city.country}`,
                    text: `${city.name}, ${city.region ? city.region + ', ' : ''}${city.country}`
                }))
            };
        },
        cache: true
    }
});

// carga de ultima ciudad desde localStorage
const lastId = localStorage.getItem(LAST_KEY);
const lastLabel = localStorage.getItem(LAST_LABEL_KEY);
if (lastId) {
    const option = new Option(lastLabel || lastId, lastId, true, true);
    $select.append(option).trigger('change');
    fetchWeatherFor(lastId);
}

function showLoading() {
    $result.html("<p>Cargando...</p>");
}

function showError(msg) {
    $result.html(`<p style="color:crimson">${msg}</p>`);
}

function renderWeather(data) {
    if (!data) return showError("No hay datos.");
    const current = data.current;
    const location = data.location || {};
    const cityName = location.name || '';
    const region = location.region || '';
    const country = location.country || '';
    const cityId = `${cityName}|${region}|${country}`;
    const forecastDays = data.forecast?.forecastday || [];

    // guardar id completo y etiqueta en localStorage (costo mas de lo que me deberia xd)
    try {
        const label = `${cityName}${region ? ', ' + region : ''}${country ? ', ' + country : ''}`;
        localStorage.setItem(LAST_KEY, cityId);
        localStorage.setItem(LAST_LABEL_KEY, label);
    } catch (e) {
        console.warn("localStorage unavailable:", e);
    }

    // Seccion principal del clima actual (ahora se supone cuando busco "la paz" no me manda a bolivia >:u)
    const currentHtml = `
        <section class="current-section">
            <div class="current-card">
                <h2>${location.name}, ${location.country}, ${location.region}</h2>
                <div class="current-row">
                    <div class="current-temp">
                        <span class="temp">${current.temp_c}°C</span>
                        <div class="cond">${current.condition.text}</div>
                    </div>
                    <div class="current-aux">
                        <img src="https:${current.condition.icon}" alt="${current.condition.text}" />
                        <p>Hum: ${current.humidity}%</p>
                        <p>Viento: ${current.wind_kph} kph</p>
                    </div>
                </div>
                <p class="last-updated">Última actualización: ${new Date(current.last_updated).toLocaleString()}</p>
            </div>
        </section>
    `;

    // Grid de 3 dias (aparentemente el limite de la API aunque se supone el limite es de 14, raro)
    const gridHtml = `
        <section class="forecast-grid-section">
            <h3>Pronóstico proximos</h3>
            <div class="forecast-grid">
                ${forecastDays.map((day, i) => {
                    const date = new Date(day.date).toLocaleDateString();
                    return `
                        <div class="day-card" data-index="${i}">
                            <div class="day-header">${date}</div>
                            <div class="day-body">
                                <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
                                <div class="day-temp">${day.day.avgtemp_c}°C</div>
                                <div class="day-cond">${day.day.condition.text}</div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        </section>
    `;

    // Secciones individuales por dia
    const detailsHtml = `
        <section class="forecast-details-section">
            ${forecastDays.map((day, i) => {
                const date = new Date(day.date).toLocaleDateString();
                return `
                    <div id="day-detail-${i}" class="day-detail" style="display:none;">
                        <h4>Datos: ${date}</h4>
                        <p>Promedio: ${day.day.avgtemp_c} °C</p>
                        <p>Máx: ${day.day.maxtemp_c} °C · Mín: ${day.day.mintemp_c} °C</p>
                        <p>Prob lluvia: ${day.day.daily_chance_of_rain ?? 'N/A'}%</p>
                        <p>${day.day.condition.text} <img src="https:${day.day.condition.icon}" alt="" class="dtlimg"></p>
                        <p>Max viento: ${day.day.maxwind_kph} kph</p>
                    </div>
                `;
            }).join("")}
        </section>
    `;

    $result.html(`<div class="weather-main">${currentHtml}${gridHtml}${detailsHtml}</div>`);

    // manejador: LocalStorage 
    $(".day-card").on("click", function() {
        const idx = $(this).data("index");
        try {
            localStorage.setItem(LAST_DAY_CITY_KEY, cityName);
            localStorage.setItem(LAST_DAY_INDEX_KEY, String(idx));
        } catch (e) {}
        const $detail = $(`#day-detail-${idx}`);
        $(".day-detail").not($detail).slideUp(150);
        $detail.slideToggle(150);
    });

    try {
        const savedCity = localStorage.getItem(LAST_DAY_CITY_KEY);
        const savedIdx = parseInt(localStorage.getItem(LAST_DAY_INDEX_KEY), 10);
        if (savedCity === cityName && !isNaN(savedIdx)) {
            const $savedDetail = $(`#day-detail-${savedIdx}`);
            if ($savedDetail.length) {
                $savedDetail.show();
                $('html, body').scrollTop($savedDetail.offset().top - 80);
            }
        }
    } catch (e) {}
}
function fetchWeatherFor(cityId) {
    if (!cityId) return showError("Selecciona una ciudad.");
    // cityIDs ahora es name|region|country para la query
    const parts = cityId.split('|');
    const name = parts[0] || '';
    const region = parts[1] || '';
    const country = parts[2] || '';
    // query para seleccion de ciudades e evitar que me mande a otra ciudad con el mismo nombre al recargar pagina (por que la API guarda por nombre de manera predeterminada)
    const query = `${name}${region ? ', ' + region : ''}${country ? ', ' + country : ''}`;

    // Mostrar loading y, en caso de erro, mostrar error de respuesta en el resultado.
    showLoading();
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=3&aqi=no&alerts=no`)
        .then(res => {
            if (!res.ok) throw new Error("Error en la respuesta de la API");
            return res.json();
        })
        .then(data => renderWeather(data))
        .catch(err => showError(err.message));
}


$select.on("select2:select", function(e) {
    const cityId = e.params.data.id;
    fetchWeatherFor(cityId);
    setTimeout(() => {
        $select.select2('close');
    }, 60);
});

$btn.on("click", function() {
    const city = $select.val();
    fetchWeatherFor(city);
});

$select.on('select2:open', function() {
  const $dd = $('.select2-dropdown');
  $dd.removeClass('animate__fadeOutUp animate__animated');
  void $dd[0].offsetWidth;
  $dd.addClass('animate__animated animate__fadeInDown');
});

$select.on('select2:closing', function(e) {
  if ($select.data('closingAnimation')) {
    $select.removeData('closingAnimation');
    return;
  }

  e.preventDefault();
  const $dd = $('.select2-dropdown');

  $dd.removeClass('animate__fadeInDown');
  void $dd[0].offsetWidth;
  $dd.addClass('animate__animated animate__fadeOutUp');


  $select.data('closingAnimation', true);

  $dd.one('animationend webkitAnimationEnd', function(ev) {
    if ($dd.hasClass('animate__fadeOutUp')) {
      $dd.removeClass('animate__animated animate__fadeOutUp');
      $select.select2('close');
    }
    $select.removeData('closingAnimation');
  });
});

//Boton de reset (añadido a ultimo minuto)
$('#rst-weather-').on('click', function () {
    try {
        localStorage.removeItem(LAST_KEY);
        localStorage.removeItem(LAST_LABEL_KEY);
        localStorage.removeItem(LAST_DAY_CITY_KEY);
        localStorage.removeItem(LAST_DAY_INDEX_KEY);
    } catch (e) { }

    $select.val(null).trigger('change');

    location.reload();
});

