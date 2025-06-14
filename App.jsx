import { useState, useMemo, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Thermometer, 
  Server, 
  Calendar, 
  Globe, 
  Map, 
  Leaf, 
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Zap,
  Wind,
  Droplets,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts'
import './App.css'

// Türkçe dil desteği
const tr = {
  title: "ThermaNest",
  subtitle: "Termit Yuvası Mimarisinden İlham",
  systemSummary: "Sistem Özeti",
  optimal: "Optimal",
  coolingMode: "Soğutma Modu",
  adaptive: "Uyarlanabilir",
  powerUsage: "Güç Kullanımı",
  efficiency: "Verimlilik",
  status: "Durum",
  online: "Çevrimiçi",
  close: "Kapat",
  features: {
    thermalProfile: {
      title: "Sunucu Başına Termal Profil",
      description: "Her sunucu birimi için gerçek zamanlı sıcaklık izleme ve analizi"
    },
    seasonalAdjustment: {
      title: "Mevsimsel Ayarlama Mantığı", 
      description: "Mevsimsel desenler ve hava durumu verilerine dayalı AI destekli soğutma tahminleri"
    },
    environmentSync: {
      title: "Dış Ortam Senkronizasyonu",
      description: "Dış hava koşulları ve çevresel faktörlerle senkronizasyon"
    },
    heatMap: {
      title: "Isı Haritası Görselleştirmesi",
      description: "Veri merkezi genelinde sıcaklık dağılımının görsel temsili"
    },
    carbonTracking: {
      title: "Canlı Karbon Takibi",
      description: "Karbon ayak izi ve enerji verimliliği metriklerinin gerçek zamanlı izlenmesi"
    },
    controlPanel: {
      title: "Kontrol Paneli Erişimi",
      description: "Gelişmiş sistem kontrolleri ve yapılandırma seçenekleri"
    }
  }
}

// Mock data - memoized for performance
const thermalData = [
  { time: '00:00', server1: 22, server2: 24, server3: 23, ambient: 20 },
  { time: '04:00', server1: 21, server2: 23, server3: 22, ambient: 19 },
  { time: '08:00', server1: 25, server2: 27, server3: 26, ambient: 22 },
  { time: '12:00', server1: 28, server2: 30, server3: 29, ambient: 25 },
  { time: '16:00', server1: 26, server2: 28, server3: 27, ambient: 24 },
  { time: '20:00', server1: 24, server2: 26, server3: 25, ambient: 22 },
]

const seasonalData = [
  { month: 'Oca', efficiency: 95, consumption: 280, prediction: 92 },
  { month: 'Şub', efficiency: 93, consumption: 290, prediction: 94 },
  { month: 'Mar', efficiency: 96, consumption: 275, prediction: 97 },
  { month: 'Nis', efficiency: 94, consumption: 285, prediction: 95 },
  { month: 'May', efficiency: 92, consumption: 310, prediction: 93 },
  { month: 'Haz', efficiency: 89, consumption: 340, prediction: 91 },
]

const environmentData = [
  { time: '6s', external: 28, internal: 23, humidity: 65, pressure: 1013 },
  { time: '12s', external: 32, internal: 24, humidity: 68, pressure: 1011 },
  { time: '18s', external: 30, internal: 23, humidity: 70, pressure: 1009 },
  { time: '24s', external: 26, internal: 22, humidity: 72, pressure: 1012 },
]

const carbonData = [
  { day: 'Pzt', saved: 120, target: 150 },
  { day: 'Sal', saved: 135, target: 150 },
  { day: 'Çar', saved: 142, target: 150 },
  { day: 'Per', saved: 128, target: 150 },
  { day: 'Cum', saved: 156, target: 150 },
  { day: 'Cmt', saved: 148, target: 150 },
  { day: 'Paz', saved: 139, target: 150 },
]

const pieData = [
  { name: 'Soğutma', value: 45, color: '#06B6D4' },
  { name: 'Sunucular', value: 35, color: '#10B981' },
  { name: 'Aydınlatma', value: 12, color: '#F59E0B' },
  { name: 'Diğer', value: 8, color: '#8B5CF6' },
]

// Memoized progress bar component for performance
const ProgressBar = memo(({ value, color = 'green' }) => (
  <div className="w-full bg-gray-700 rounded-full h-2">
    <div 
      className={`bg-${color}-400 h-2 rounded-full transition-all duration-300`} 
      style={{width: `${value}%`}}
    />
  </div>
))

// Memoized feature card component
const FeatureCard = memo(({ feature, onClick, isActive }) => {
  const IconComponent = feature.icon
  return (
    <Card 
      className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer transform hover:scale-105 ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <IconComponent className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
            <p className="text-xs text-gray-400">{feature.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

function App() {
  const [activePopup, setActivePopup] = useState(null)
  const [currentTemp] = useState(22.8)

  // Memoized feature definitions
  const features = useMemo(() => [
    {
      id: 'thermal-profile',
      title: tr.features.thermalProfile.title,
      icon: Server,
      description: tr.features.thermalProfile.description,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Cpu className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Sunucu 1</div>
              <div className="text-sm text-white">Raf A-01</div>
              <div className="text-lg font-semibold text-green-400 mt-2">22°C</div>
              <div className="mt-2">
                <ProgressBar value={65} color="green" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Cpu className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Sunucu 2</div>
              <div className="text-sm text-white">Raf A-02</div>
              <div className="text-lg font-semibold text-yellow-400 mt-2">24°C</div>
              <div className="mt-2">
                <ProgressBar value={75} color="yellow" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <Cpu className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Sunucu 3</div>
              <div className="text-sm text-white">Raf A-03</div>
              <div className="text-lg font-semibold text-orange-400 mt-2">23°C</div>
              <div className="mt-2">
                <ProgressBar value={70} color="orange" />
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={thermalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="server1" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="server2" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="server3" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Area type="monotone" dataKey="ambient" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Uyarılar</span>
              </div>
              <div className="text-xs text-white">Sunucu 2: Yüksek yük tespit edildi</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-white">Durum</span>
              </div>
              <div className="text-xs text-white">Tüm sistemler çalışıyor</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'seasonal-adjustment',
      title: tr.features.seasonalAdjustment.title,
      icon: Calendar,
      description: tr.features.seasonalAdjustment.description,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-6 h-6 text-yellow-400" />
                <span className="font-semibold text-white">Yaz Modu</span>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">Aktif</div>
              <div className="text-sm text-white">Yüksek verimli soğutma</div>
              <div className="mt-2">
                <ProgressBar value={85} color="green" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <span className="font-semibold text-white">Sonraki Ayarlama</span>
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">1.5s</div>
              <div className="text-sm text-white">Tahmin edilen değişiklik</div>
              <div className="mt-2">
                <ProgressBar value={60} color="blue" />
              </div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="efficiency" fill="#10B981" />
                <Bar dataKey="prediction" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">+%15</div>
              <div className="text-xs text-gray-400">Verimlilik Artışı</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">-%8</div>
              <div className="text-xs text-gray-400">Enerji Azalması</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">%94</div>
              <div className="text-xs text-gray-400">Tahmin Doğruluğu</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'environment-sync',
      title: tr.features.environmentSync.title,
      icon: Globe,
      description: tr.features.environmentSync.description,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-6 h-6 text-orange-400" />
                <span className="font-semibold">Dış Sıcaklık</span>
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-1">32°C</div>
              <div className="text-sm text-gray-400">Yükseliş trendi</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400">2 saatte +2°C</span>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-6 h-6 text-blue-400" />
                <span className="font-semibold">Nem</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">%68</div>
              <div className="text-sm text-gray-400">Optimal aralık</div>
              <div className="mt-2">
                <ProgressBar value={68} color="blue" />
              </div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="external" stroke="#F59E0B" strokeWidth={3} />
                <Line type="monotone" dataKey="internal" stroke="#10B981" strokeWidth={3} />
                <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <Wind className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-cyan-400">12 km/s</div>
              <div className="text-xs text-gray-400">Rüzgar Hızı</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-green-400">1013 hPa</div>
              <div className="text-xs text-gray-400">Basınç</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <Sun className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-yellow-400">UV 8</div>
              <div className="text-xs text-gray-400">UV İndeksi</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-green-400">Senkron</div>
              <div className="text-xs text-gray-400">API Durumu</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'heat-map',
      title: tr.features.heatMap.title,
      icon: Map,
      description: tr.features.heatMap.description,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-8 gap-1 p-4 bg-gray-800 rounded-lg">
            {Array.from({ length: 64 }, (_, i) => {
              const temp = 18 + Math.random() * 14
              const getColor = (temp) => {
                if (temp < 20) return 'bg-blue-500'
                if (temp < 23) return 'bg-green-500'
                if (temp < 26) return 'bg-yellow-500'
                if (temp < 29) return 'bg-orange-500'
                return 'bg-red-500'
              }
              return (
                <div 
                  key={i} 
                  className={`h-6 rounded-sm ${getColor(temp)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  title={`Bölge ${i + 1}: ${temp.toFixed(1)}°C`}
                />
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-400">Sıcaklık Bölgeleri</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Soğuk (18-20°C)</span>
                  <span className="text-xs text-gray-400 ml-auto">12 bölge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Optimal (20-23°C)</span>
                  <span className="text-xs text-gray-400 ml-auto">28 bölge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Ilık (23-26°C)</span>
                  <span className="text-xs text-gray-400 ml-auto">18 bölge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">Sıcak (26-29°C)</span>
                  <span className="text-xs text-gray-400 ml-auto">5 bölge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Kritik (29°C+)</span>
                  <span className="text-xs text-gray-400 ml-auto">1 bölge</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-400">İstatistikler</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Ortalama Sıcaklık</span>
                  <span className="text-sm font-bold text-green-400">23.2°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">En Sıcak Bölge</span>
                  <span className="text-sm font-bold text-red-400">31.5°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">En Soğuk Bölge</span>
                  <span className="text-sm font-bold text-blue-400">18.2°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Verimlilik</span>
                  <span className="text-sm font-bold text-cyan-400">%87</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'carbon-tracking',
      title: tr.features.carbonTracking.title,
      icon: Leaf,
      description: tr.features.carbonTracking.description,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-6 h-6 text-green-400" />
                <span className="font-semibold">Bugün Tasarruf Edilen CO₂</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">126 kg</div>
              <div className="text-sm text-gray-400">geleneksel soğutmaya karşı</div>
              <div className="mt-2">
                <ProgressBar value={84} color="green" />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <span className="font-semibold">Enerji Verimliliği</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">%94</div>
              <div className="text-sm text-gray-400">Mevcut performans</div>
              <div className="mt-2">
                <ProgressBar value={94} color="yellow" />
              </div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="saved" fill="#10B981" />
                <Bar dataKey="target" fill="#374151" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-cyan-400 text-sm">Enerji Dağılımı</h4>
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs">{item.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">%{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-green-400">-%12</div>
              <div className="text-xs text-gray-400">Emisyonlar</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-blue-400">%98</div>
              <div className="text-xs text-gray-400">Hedef Karşılandı</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <BarChart3 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-purple-400">1.2 ton</div>
              <div className="text-xs text-gray-400">Aylık</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'control-panel',
      title: tr.features.controlPanel.title,
      icon: Settings,
      description: tr.features.controlPanel.description,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-6 h-6 text-cyan-400" />
                <span className="font-semibold">Sistem Durumu</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Soğutma Sistemi</span>
                  <span className="text-xs text-green-400 ml-auto">Çevrimiçi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">AI Kontrolcüsü</span>
                  <span className="text-xs text-green-400 ml-auto">Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Yedek Sistem</span>
                  <span className="text-xs text-yellow-400 ml-auto">Beklemede</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-6 h-6 text-blue-400" />
                <span className="font-semibold">Performans</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Kullanımı</span>
                    <span>%23</span>
                  </div>
                  <ProgressBar value={23} color="green" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bellek</span>
                    <span>%67</span>
                  </div>
                  <ProgressBar value={67} color="yellow" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Ağ</span>
                    <span>%45</span>
                  </div>
                  <ProgressBar value={45} color="blue" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-cyan-400">Hızlı İşlemler</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start h-12">
                <Thermometer className="w-5 h-5 mr-3 text-orange-400" />
                <div className="text-left">
                  <div className="font-semibold">Sıcaklık Geçersiz Kılma</div>
                  <div className="text-xs text-gray-400">Manuel kontrol</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-12">
                <Zap className="w-5 h-5 mr-3 text-yellow-400" />
                <div className="text-left">
                  <div className="font-semibold">Güç Yönetimi</div>
                  <div className="text-xs text-gray-400">Enerji ayarları</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-12">
                <Activity className="w-5 h-5 mr-3 text-green-400" />
                <div className="text-left">
                  <div className="font-semibold">Performans Ayarı</div>
                  <div className="text-xs text-gray-400">Sistemi optimize et</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-12">
                <AlertTriangle className="w-5 h-5 mr-3 text-red-400" />
                <div className="text-left">
                  <div className="font-semibold">Acil Durum Modu</div>
                  <div className="text-xs text-gray-400">Kritik geçersiz kılma</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-cyan-400 mb-3">Son Aktiviteler</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>12:34 - Sıcaklık eşiği ayarlandı</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>12:28 - AI modeli güncellendi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>12:15 - Yedek sistem test edildi</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ], [])

  // Memoized handlers
  const handleFeatureClick = useCallback((featureId) => {
    setActivePopup(activePopup === featureId ? null : featureId)
  }, [activePopup])

  const handleClosePopup = useCallback(() => {
    setActivePopup(null)
  }, [])

  // Split features for layout
  const leftFeatures = useMemo(() => features.slice(0, 3), [features])
  const rightFeatures = useMemo(() => features.slice(3, 6), [features])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-teal-400">
          ThermaNest
        </h1>
        <p className="text-white mt-2">{tr.subtitle}</p>
      </div>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column - Feature Buttons */}
          <div className="space-y-4">
            {leftFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onClick={() => handleFeatureClick(feature.id)}
                isActive={activePopup === feature.id}
              />
            ))}
          </div>

          {/* Center Column - Main Control Panel (Expanded) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-white">{tr.systemSummary}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {/* Temperature Gauge */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <div>
                      <div className="text-5xl font-bold text-cyan-400">{currentTemp}°C</div>
                      <div className="text-lg text-gray-400">{tr.optimal}</div>
                    </div>
                  </div>
                  {/* Animated pulse effect - removed */}
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-2 gap-6 text-lg">
                  <div>
                    <div className="text-gray-400">{tr.coolingMode}</div>
                    <div className="font-semibold text-teal-400">{tr.adaptive}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{tr.powerUsage}</div>
                    <div className="font-semibold text-teal-400">326 kW</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{tr.efficiency}</div>
                    <div className="font-semibold text-teal-400">%94</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{tr.status}</div>
                    <div className="font-semibold text-teal-400">{tr.online}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Feature Buttons */}
          <div className="space-y-4">
            {rightFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onClick={() => handleFeatureClick(feature.id)}
                isActive={activePopup === feature.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Popup Modal */}
      {activePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="flex items-center gap-2 text-white">
                {(() => {
                  const feature = features.find(f => f.id === activePopup)
                  const IconComponent = feature?.icon
                  return (
                    <>
                      <IconComponent className="w-6 h-6 text-cyan-400" />
                      {feature?.title}
                    </>
                  )
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {features.find(f => f.id === activePopup)?.content}
              <Button 
                className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700" 
                onClick={handleClosePopup}
              >
                {tr.close}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default App

