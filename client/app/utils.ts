interface Song {
  id: string;
  trackId: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

export const parseSongCSV = async (csvData: string): Promise<Song[]> => {
  const songs: Song[] = [];

  const rows = csvData.split('\n');
  let headerRow: string[] | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].trim();

		// Skip empty rows
    if (!row) {continue;}

    if (!headerRow) {
      headerRow = row.split(';');
    } else {
      const values = row.split(';');
      const song: Record<string, string | string[]> = {};

      for (let j = 0; j < headerRow.length; j++) {
        const header = headerRow[j];
        const value = values[j];

        if (header === 'artists') {
          if (value) {
            // Remove leading and trailing square brackets
            const trimmedValue = value.replace(/^\[|]$/g, '');
            song[header] = trimmedValue.split(',').map(artist => artist.trim().replace(/^['"]|['"]$/g, ''));
          } else {
            song[header] = [];
          }
        } else {
          song[header] = value.trim();
        }
      }

      songs.push({
        id: song.id as string,
        trackId: song.track_id as string,
        name: song.name as string,
        artists: Array.isArray(song.artists) ? song.artists : [],
        genre: song.genre as string,
        subgenre: song.subgenre as string,
      });
    }
  }

  return songs;
};