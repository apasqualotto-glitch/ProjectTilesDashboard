import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Calendar } from "lucide-react";

export function WeatherWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    city: string;
  }>({
    temp: 21, // Default fallback temperature in Celsius
    condition: "sunny",
    city: "Local",
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get weather using Open-Meteo API (no API key required)
  useEffect(() => {
    const fetchWeatherByCoords = async (lat: number, lon: number, cityLabel: string) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        );
        
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const weatherCode = data.current_weather.weathercode;
          
          // Map weather codes to conditions
          let condition = "clear";
          if (weatherCode === 0) condition = "sunny";
          else if ([1, 2, 3].includes(weatherCode)) condition = "cloudy";
          else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) condition = "rainy";
          else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) condition = "snowy";
          
          setWeather({
            temp,
            condition,
            city: cityLabel,
          });
        } else {
          // API response missing weather data - use fallback
          setWeather({
            temp: 21, // Realistic Celsius fallback (~70°F)
            condition: "sunny",
            city: cityLabel,
          });
        }
      } catch (error) {
        console.error("Weather API fetch failed:", error);
        // Set fallback weather data so widget always shows something
        setWeather({
          temp: 21, // Realistic Celsius fallback (~70°F)
          condition: "sunny",
          city: cityLabel,
        });
      }
    };

    const fetchWeather = async () => {
      try {
        // Try to get user's location
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchWeatherByCoords(latitude, longitude, "Local");
            },
            () => {
              // Geolocation denied - use default location (San Francisco)
              fetchWeatherByCoords(37.77, -122.41, "SF");
            }
          );
        } else {
          // No geolocation support - use default location
          await fetchWeatherByCoords(37.77, -122.41, "SF");
        }
      } catch (error) {
        console.error("Weather fetch failed:", error);
      }
    };
    
    fetchWeather();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getWeatherIcon = (condition?: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-4 h-4" />;
      case "cloudy":
        return <Cloud className="w-4 h-4" />;
      case "rainy":
        return <CloudRain className="w-4 h-4" />;
      case "snowy":
        return <Snowflake className="w-4 h-4" />;
      default:
        return <Wind className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-4 text-sm" data-testid="widget-weather">
      {/* Date */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(currentTime)}</span>
      </div>

      {/* Time */}
      <div className="font-mono text-foreground font-medium">
        {formatTime(currentTime)}
      </div>

      {/* Weather */}
      <div className="flex items-center gap-2 text-muted-foreground">
        {getWeatherIcon(weather.condition)}
        <span>{weather.temp}°C</span>
        <span className="text-xs opacity-75">({weather.city})</span>
      </div>
    </div>
  );
}
