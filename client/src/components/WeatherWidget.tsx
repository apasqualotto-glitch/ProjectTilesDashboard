import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Calendar } from "lucide-react";

export function WeatherWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{
    temp?: number;
    condition?: string;
    city?: string;
  } | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get weather (optional - using mock data since we don't want to require API keys)
  useEffect(() => {
    // In a real app, you would fetch from OpenWeatherMap API:
    // fetch(`https://api.openweathermap.org/data/2.5/weather?q=city&appid=${API_KEY}`)
    
    // For now, use mock weather data
    const mockWeather = {
      temp: Math.floor(Math.random() * 20) + 60, // 60-80°F
      condition: ["sunny", "cloudy", "rainy"][Math.floor(Math.random() * 3)],
      city: "Local",
    };
    setWeather(mockWeather);
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

      {/* Weather (optional) */}
      {weather && (
        <div className="flex items-center gap-2 text-muted-foreground">
          {getWeatherIcon(weather.condition)}
          <span>{weather.temp}°F</span>
        </div>
      )}
    </div>
  );
}
