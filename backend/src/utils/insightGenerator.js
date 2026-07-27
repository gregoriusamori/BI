const InsightGenerator = {
  genreShare(genres) {
    if (!genres || genres.length === 0) return 'No genre data available.';
    const total = genres.reduce((s, g) => s + Number(g.track_count || g.count || 0), 0);
    const top = genres[0];
    const topCount = Number(top.track_count || top.count || 0);
    const topPct = total > 0 ? ((topCount / total) * 100).toFixed(1) : 0;

    if (genres.length === 1) {
      return `Genre ${top.genre_name} mencakup seluruh dataset (${topCount} track).`;
    }
    const second = genres[1];
    const secondCount = Number(second.track_count || second.count || 0);
    const secondPct = total > 0 ? ((secondCount / total) * 100).toFixed(1) : 0;
    const gap = (topPct - secondPct).toFixed(1);

    if (gap > 20) {
      return `Genre ${top.genre_name} mendominasi dengan ${topPct}% dari total track, jauh di atas genre kedua (${second.genre_name}, ${secondPct}%). Selisih ${gap} poin menunjukkan dataset sangat condong ke genre ini.`;
    }
    if (gap > 5) {
      return `Genre ${top.genre_name} menempati posisi teratas (${topPct}%), diikuti ${second.genre_name} (${secondPct}%). Dominasi moderat menunjukkan distribusi yang cukup beragam.`;
    }
    return `Genre tersebar cukup merata. ${top.genre_name} (${topPct}%) dan ${second.genre_name} (${secondPct}%) bersaing ketat, menunjukkan koleksi musik yang beragam.`;
  },

  yearTrend(yearData) {
    if (!yearData || yearData.length === 0) return 'No year data available.';
    const data = yearData.map(d => ({ year: d.year, count: Number(d.track_count) }));
    const peak = data.reduce((max, d) => d.count > max.count ? d : max, data[0]);
    const low = data.reduce((min, d) => d.count < min.count ? d : min, data[0]);
    const total = data.reduce((s, d) => s + d.count, 0);
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const avgFirst = firstHalf.reduce((s, d) => s + d.count, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, d) => s + d.count, 0) / secondHalf.length;
    const trend = avgSecond > avgFirst * 1.1 ? 'meningkat' : avgSecond < avgFirst * 0.9 ? 'menurun' : 'relatif stabil';

    return `Puncak jumlah track terjadi pada tahun ${peak.year} (${peak.count} track), sedangkan tahun terendah adalah ${low.year} (${low.count} track). Total ${total} track tersebar dalam ${data.length} tahun dengan tren ${trend} dari paruh awal ke paruh akhir.`;
  },

  overview(stats) {
    if (!stats) return 'No overview data available.';
    const { totalTracks, totalArtists, totalGenres, avgPopularity } = stats;
    const avgTracksPerArtist = totalArtists > 0 ? (totalTracks / totalArtists).toFixed(1) : 0;
    const popLevel = avgPopularity >= 70 ? 'tinggi' : avgPopularity >= 40 ? 'sedang' : 'rendah';
    return `Dataset berisi ${totalTracks.toLocaleString()} track dari ${totalArtists.toLocaleString()} artist dalam ${totalGenres} genre. Rata-rata ${avgTracksPerArtist} track per artist dengan popularitas rata-rata ${avgPopularity} (${popLevel}).`;
  },

  audioFeatures(stats) {
    if (!stats) return 'No audio features data available.';
    const features = [
      { name: 'Danceability', val: Number(stats.avg_danceability || 0) },
      { name: 'Energy', val: Number(stats.avg_energy || 0) },
      { name: 'Speechiness', val: Number(stats.avg_speechiness || 0) },
      { name: 'Acousticness', val: Number(stats.avg_acousticness || 0) },
      { name: 'Instrumentalness', val: Number(stats.avg_instrumentalness || 0) },
      { name: 'Liveness', val: Number(stats.avg_liveness || 0) },
      { name: 'Valence', val: Number(stats.avg_valence || 0) },
    ].sort((a, b) => b.val - a.val);

    const highest = features[0];
    const lowest = features[features.length - 1];
    return `Fitur audio dominan: ${highest.name} (${(highest.val * 100).toFixed(0)}%), diikuti ${features[1].name} (${(features[1].val * 100).toFixed(0)}%). Fitur terendah: ${lowest.name} (${(lowest.val * 100).toFixed(0)}%). Profil sonik ini menunjukkan karakter khas dari koleksi musik.`;
  },

  popularityDistribution(dist) {
    if (!dist || dist.length === 0) return 'No popularity data available.';
    const total = dist.reduce((s, d) => s + Number(d.count), 0);
    const sorted = [...dist].sort((a, b) => Number(b.count) - Number(a.count));
    const top = sorted[0];
    const topPct = total > 0 ? ((Number(top.count) / total) * 100).toFixed(1) : 0;
    const high = dist.filter(d => {
      const r = d.range;
      return r === '60-79' || r === '80-100';
    }).reduce((s, d) => s + Number(d.count), 0);
    const highPct = total > 0 ? ((high / total) * 100).toFixed(1) : 0;

    return `Rentang popularitas ${top.range} memiliki jumlah track terbanyak (${top.count} track, ${topPct}%). Sebanyak ${highPct}% track memiliki popularitas di atas 60, menunjukkan proporsi track mainstream dalam dataset.`;
  },

  genreReport(genres) {
    if (!genres || genres.length === 0) return 'No genre report available.';
    const total = genres.reduce((s, g) => s + Number(g.total_tracks), 0);
    const top = genres[0];
    const topPct = total > 0 ? ((Number(top.total_tracks) / total) * 100).toFixed(1) : 0;
    const avgPop = genres.reduce((s, g) => s + Number(g.avg_popularity || 0), 0) / genres.length;
    const highestPop = [...genres].sort((a, b) => Number(b.avg_popularity || 0) - Number(a.avg_popularity || 0))[0];

    return `${genres.length} genre dianalisis. ${top.genre_name} paling dominan (${top.total_tracks} track, ${topPct}%). Genre dengan popularitas tertinggi: ${highestPop.genre_name} (avg ${Number(highestPop.avg_popularity).toFixed(1)}). Rata-rata popularitas seluruh genre: ${avgPop.toFixed(1)}.`;
  },

  artistReport(artists) {
    if (!artists || artists.length === 0) return 'No artist report available.';
    const top = artists[0];
    const total = artists.reduce((s, a) => s + Number(a.total_tracks), 0);
    const avgPop = artists.reduce((s, a) => s + Number(a.avg_popularity || 0), 0) / artists.length;
    const range = artists.length > 1
      ? `${artists[artists.length - 1].artist_name} (${artists[artists.length - 1].total_tracks} track)`
      : top.artist_name;

    return `${artists.length} artist teratas memiliki total ${total} track. ${top.artist_name} memimpin dengan ${top.total_tracks} track (avg pop: ${Number(top.avg_popularity).toFixed(1)}). Rata-rata popularitas artist: ${avgPop.toFixed(1)}.`;
  },

  decadeReport(decades) {
    if (!decades || decades.length === 0) return 'No decade data available.';
    const sorted = [...decades].sort((a, b) => Number(b.total_tracks) - Number(a.total_tracks));
    const peak = sorted[0];
    const total = decades.reduce((s, d) => s + Number(d.total_tracks), 0);
    const first = decades[0];
    const last = decades[decades.length - 1];
    const trend = Number(last.total_tracks) > Number(first.total_tracks) ? 'meningkat' : 'menurun';

    return `Dekade ${peak.decade}s memiliki jumlah track terbanyak (${peak.total_tracks} dari ${total} total). Tren produksi musik dari ${first.decade}s ke ${last.decade}s menunjukkan pola ${trend}.`;
  },

  clusterStats(clusters) {
    if (!clusters || clusters.length === 0) return 'No clustering data available. Run K-Means to generate clusters.';
    const total = clusters.reduce((s, c) => s + Number(c.track_count), 0);
    const largest = [...clusters].sort((a, b) => Number(b.track_count) - Number(a.track_count))[0];
    const smallest = [...clusters].sort((a, b) => Number(a.track_count) - Number(b.track_count))[0];
    const mostDanceable = [...clusters].sort((a, b) => Number(b.avg_danceability || 0) - Number(a.avg_danceability || 0))[0];
    const mostPopular = [...clusters].sort((a, b) => Number(b.avg_popularity || 0) - Number(a.avg_popularity || 0))[0];

    return `${clusters.length} cluster ditemukan dari ${total} track. Cluster terbesar: "${largest.cluster_label || 'Cluster ' + largest.cluster_id}" (${largest.track_count} track). Cluster paling danceable: "${mostDanceable.cluster_label || 'Cluster ' + mostDanceable.cluster_id}" (${(Number(mostDanceable.avg_danceability) * 100).toFixed(0)}%). Cluster paling populer: "${mostPopular.cluster_label || 'Cluster ' + mostPopular.cluster_id}" (avg ${Number(mostPopular.avg_popularity).toFixed(1)}).`;
  },

  correlation(corr) {
    if (!corr) return 'No correlation data available.';
    const pairs = [
      { a: 'Danceability', b: 'Energy', val: Number(corr.dance_energy || 0) },
      { a: 'Danceability', b: 'Valence', val: Number(corr.dance_valence || 0) },
      { a: 'Energy', b: 'Loudness', val: Number(corr.energy_loud || 0) },
      { a: 'Energy', b: 'Acousticness', val: Number(corr.acoustic_energy || 0) },
      { a: 'Valence', b: 'Energy', val: Number(corr.valence_energy || 0) },
    ].sort((a, b) => Math.abs(b.val) - Math.abs(a.val));

    const strongest = pairs[0];
    const weakest = pairs[pairs.length - 1];
    const sign = strongest.val > 0 ? 'positif' : 'negatif';

    return `Korelasi terkuat: ${strongest.a}-${strongest.b} (${sign}, r=${strongest.val.toFixed(2)}). Korelasi terlemah: ${weakest.a}-${weakest.b} (r=${weakest.val.toFixed(2)}). Korelasi ini mengungkap hubungan tersembunyi antar fitur audio.`;
  },

  topArtists(artists) {
    if (!artists || artists.length === 0) return 'No artist data available.';
    const total = artists.reduce((s, a) => s + Number(a.track_count), 0);
    const top = artists[0];
    const pops = artists.map(a => Number(a.avg_popularity || 0));
    const avgPop = (pops.reduce((s, p) => s + p, 0) / pops.length).toFixed(1);
    const maxPop = Math.max(...pops);
    const minPop = Math.min(...pops);
    const mostPop = artists.find(a => Number(a.avg_popularity) === maxPop);
    const leastPop = artists.find(a => Number(a.avg_popularity) === minPop);

    return `${top.artist_name} memimpin dengan ${top.track_count} track. Dari ${artists.length} artist teratas, rata-rata popularitas ${avgPop}. Artist paling populer: ${mostPop.artist_name} (${maxPop}), least populer: ${leastPop.artist_name} (${minPop}). Total ${total} track dari seluruh artist ini.`;
  },
};

module.exports = InsightGenerator;
