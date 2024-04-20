interface Song {
  id: number;
  track_id: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

// Parse songs.csv and load the songs in Song[]
export const parseSongCSV = async (csvData: string): Promise<Song[]> => {
  const songs: Song[] = [];

  const rows = csvData.split('\n');
  let headerRow: string[] | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].trim();

    if (!row) {continue;} // Skip empty rows

    if (!headerRow) {
      headerRow = row.split(';');
    } else {
      const values = row.split(';');
      const song: Record<string, number | string | string[]> = {};

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
        } else if (header === 'id') {
          // Convert the id value to a number
          song[header] = parseInt(value, 10);
				} else {
          song[header] = value.trim();
        }
      }

      songs.push({
        id: song.id as number,
        track_id: song.track_id as string,
        name: song.name as string,
        artists: Array.isArray(song.artists) ? song.artists : [],
        genre: song.genre as string,
        subgenre: song.subgenre as string,
      });
    }
  }

  return songs;
};