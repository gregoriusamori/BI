import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import StatCard from '../components/Common/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from 'recharts';

export default function BIPage() {
  const [overview, setOverview] = useState(null);
  const [genres, setGenres] = useState([]);
  const [audioStats, setAudioStats] = useState(null);
  const [popDist, setPopDist] = useState([]);
  const [yearTrend, setYearTrend] = useState([]);

  useEffect(() => {
    api.get('/bi/overview').then(r => setOverview(r.data));
    api.get('/bi/genre-distribution').then(r => setGenres(r.data));
    api.get('/bi/audio-features').then(r => setAudioStats(r.data));
    api.get('/bi/popularity-distribution').then(r => setPopDist(r.data));
    api.get('/bi/year-trend').then(r => setYearTrend(r.data.slice(-20)));
  }, []);

  const radarData = audioStats ? [
    { feature: 'Dance', value: Number(audioStats.avg_danceability) * 100 },
    { feature: 'Energy', value: Number(audioStats.avg_energy) * 100 },
    { feature: 'Speech', value: Number(audioStats.avg_speechiness) * 100 },
    { feature: 'Acoustic', value: Number(audioStats.avg_acousticness) * 100 },
    { feature: 'Live', value: Number(audioStats.avg_liveness) * 100 },
    { feature: 'Valence', value: Number(audioStats.avg_valence) * 100 },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">BI Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Tracks" value={overview?.totalTracks || '-'} color="blue" />
        <StatCard label="Avg Popularity" value={overview?.avgPopularity || '-'} color="green" />
        <StatCard label="Total Genres" value={overview?.totalGenres || '-'} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Audio Features Profile">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="feature" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Average" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Popularity Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popDist}>
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Genre Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genres} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="genre_name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Track Count by Year (Last 20)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearTrend}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="track_count" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
