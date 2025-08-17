"use client"

import { useState, useEffect } from "react"
import { Cloud, Sun, CloudRain, Thermometer, Wind, Eye, Droplets, MapPin } from "lucide-react"

const WeatherWidget = ({ destination, coordinates }) => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchWeatherData()
  }, [destination])

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      // In a real app, you'd call a weather API like OpenWeatherMap
      // For now, we'll use mock data based on destination
      const mockWeather = getMockWeatherData(destination)

      setTimeout(() => {
        setWeather(mockWeather)
        setLoading(false)
      }, 1000)
    } catch (err) {
      setError("Failed to fetch weather data")
      setLoading(false)
    }
  }

  const getMockWeatherData = (dest) => {
    const weatherData = {
      "Hunza Valley": {
        current: {
          temperature: 18,
          condition: "Partly Cloudy",
          humidity: 45,
          windSpeed: 8,
          visibility: 15,
          feelsLike: 20,
        },
        forecast: [
          { date: "Today", maxTemp: 22, minTemp: 12, condition: "Sunny", precipitation: 0 },
          { date: "Tomorrow", maxTemp: 20, minTemp: 10, condition: "Partly Cloudy", precipitation: 10 },
          { date: "Day 3", maxTemp: 18, minTemp: 8, condition: "Cloudy", precipitation: 20 },
          { date: "Day 4", maxTemp: 16, minTemp: 6, condition: "Light Rain", precipitation: 60 },
        ],
        bestTime: "April to October (Spring to Autumn)",
        seasonalTips: "Perfect weather for trekking and sightseeing. Cherry blossoms in April!",
      },
      Lahore: {
        current: {
          temperature: 28,
          condition: "Sunny",
          humidity: 65,
          windSpeed: 12,
          visibility: 8,
          feelsLike: 32,
        },
        forecast: [
          { date: "Today", maxTemp: 32, minTemp: 22, condition: "Sunny", precipitation: 0 },
          { date: "Tomorrow", maxTemp: 34, minTemp: 24, condition: "Hot", precipitation: 0 },
          { date: "Day 3", maxTemp: 30, minTemp: 20, condition: "Partly Cloudy", precipitation: 5 },
          { date: "Day 4", maxTemp: 28, minTemp: 18, condition: "Cloudy", precipitation: 15 },
        ],
        bestTime: "November to March (Winter)",
        seasonalTips: "Visit during winter months for pleasant weather. Summer can be very hot!",
      },
      Skardu: {
        current: {
          temperature: 15,
          condition: "Clear",
          humidity: 35,
          windSpeed: 6,
          visibility: 20,
          feelsLike: 17,
        },
        forecast: [
          { date: "Today", maxTemp: 20, minTemp: 8, condition: "Clear", precipitation: 0 },
          { date: "Tomorrow", maxTemp: 22, minTemp: 10, condition: "Sunny", precipitation: 0 },
          { date: "Day 3", maxTemp: 18, minTemp: 6, condition: "Partly Cloudy", precipitation: 5 },
          { date: "Day 4", maxTemp: 16, minTemp: 4, condition: "Cloudy", precipitation: 10 },
        ],
        bestTime: "May to September (Summer)",
        seasonalTips: "Ideal for K2 expeditions and lake visits. Clear mountain views expected!",
      },
      Karachi: {
        current: {
          temperature: 26,
          condition: "Partly Cloudy",
          humidity: 75,
          windSpeed: 15,
          visibility: 12,
          feelsLike: 29,
        },
        forecast: [
          { date: "Today", maxTemp: 30, minTemp: 24, condition: "Partly Cloudy", precipitation: 10 },
          { date: "Tomorrow", maxTemp: 28, minTemp: 22, condition: "Cloudy", precipitation: 20 },
          { date: "Day 3", maxTemp: 32, minTemp: 26, condition: "Sunny", precipitation: 0 },
          { date: "Day 4", maxTemp: 29, minTemp: 23, condition: "Partly Cloudy", precipitation: 15 },
        ],
        bestTime: "November to February (Winter)",
        seasonalTips: "Sea breeze provides relief. Great for beach activities and city exploration!",
      },
    }

    return weatherData[dest] || weatherData["Hunza Valley"]
  }

  const getWeatherIcon = (condition) => {
    if (condition.includes("Sunny") || condition.includes("Clear"))
      return <Sun size={24} style={{ color: "#f59e0b" }} />
    if (condition.includes("Rain")) return <CloudRain size={24} style={{ color: "#3b82f6" }} />
    if (condition.includes("Hot")) return <Sun size={24} style={{ color: "#ef4444" }} />
    return <Cloud size={24} style={{ color: "#6b7280" }} />
  }

  const getSmallWeatherIcon = (condition) => {
    if (condition.includes("Sunny") || condition.includes("Clear"))
      return <Sun size={16} style={{ color: "#f59e0b" }} />
    if (condition.includes("Rain")) return <CloudRain size={16} style={{ color: "#3b82f6" }} />
    if (condition.includes("Hot")) return <Sun size={16} style={{ color: "#ef4444" }} />
    return <Cloud size={16} style={{ color: "#6b7280" }} />
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-content">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Cloud size={20} style={{ color: "#64748b" }} />
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Weather</h3>
          </div>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #e2e8f0",
                borderTop: "3px solid var(--primary-blue)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
              }}
            ></div>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Loading weather data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-content">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Cloud size={20} style={{ color: "#64748b" }} />
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Weather</h3>
          </div>
          <p style={{ color: "#ef4444", fontSize: "14px", textAlign: "center" }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-content">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <MapPin size={20} style={{ color: "var(--primary-blue)" }} />
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Weather in {destination}</h3>
        </div>

        {/* Current Weather */}
        <div
          style={{
            marginBottom: "20px",
            padding: "20px",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div className="flex-between mb-3">
            <div className="flex" style={{ alignItems: "center", gap: "12px" }}>
              {getWeatherIcon(weather.current.condition)}
              <div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "#1e293b" }}>
                  {weather.current.temperature}°C
                </div>
                <div style={{ fontSize: "14px", color: "#64748b" }}>Feels like {weather.current.feelsLike}°C</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>{weather.current.condition}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-3" style={{ gap: "16px", fontSize: "13px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px",
                background: "white",
                borderRadius: "8px",
              }}
            >
              <Droplets size={16} style={{ color: "#3b82f6" }} />
              <div>
                <div style={{ fontWeight: "600" }}>{weather.current.humidity}%</div>
                <div style={{ color: "#64748b", fontSize: "11px" }}>Humidity</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px",
                background: "white",
                borderRadius: "8px",
              }}
            >
              <Wind size={16} style={{ color: "#10b981" }} />
              <div>
                <div style={{ fontWeight: "600" }}>{weather.current.windSpeed} km/h</div>
                <div style={{ color: "#64748b", fontSize: "11px" }}>Wind</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px",
                background: "white",
                borderRadius: "8px",
              }}
            >
              <Eye size={16} style={{ color: "#8b5cf6" }} />
              <div>
                <div style={{ fontWeight: "600" }}>{weather.current.visibility} km</div>
                <div style={{ color: "#64748b", fontSize: "11px" }}>Visibility</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Day Forecast */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ fontSize: "1rem", marginBottom: "12px", color: "#374151" }}>4-Day Forecast</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {weather.forecast.map((day, index) => (
              <div
                key={index}
                className="flex-between"
                style={{
                  padding: "12px 16px",
                  background: index === 0 ? "#eff6ff" : "white",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: index === 0 ? "600" : "500",
                      minWidth: "70px",
                      color: index === 0 ? "var(--primary-blue)" : "#374151",
                    }}
                  >
                    {day.date}
                  </span>
                  {getSmallWeatherIcon(day.condition)}
                  <span style={{ fontSize: "13px", color: "#64748b" }}>{day.condition}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {day.precipitation > 0 && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#3b82f6",
                        background: "#dbeafe",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {day.precipitation}%
                    </span>
                  )}
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>
                    {day.maxTemp}°/{day.minTemp}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Time to Visit */}
        <div
          style={{
            padding: "16px",
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            borderRadius: "10px",
            border: "1px solid #10b981",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Thermometer size={16} style={{ color: "#059669" }} />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#059669" }}>Best Time to Visit</span>
          </div>
          <p style={{ fontSize: "13px", color: "#065f46", margin: "0 0 8px 0", fontWeight: "500" }}>
            {weather.bestTime}
          </p>
          <p style={{ fontSize: "12px", color: "#047857", margin: 0 }}>💡 {weather.seasonalTips}</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default WeatherWidget
