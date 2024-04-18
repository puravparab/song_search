import { useState } from 'react';

interface Song {
  id: string;
  trackId: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

const Display: React.FC<{selectedSongs: Song[], handleSongClick: (song: Song) => void}> = ({ selectedSongs, handleSongClick }) => {
	const allGenres = ['pop', 'rap', 'rock', 'latin', 'r&b', 'edm'];
  const [selectedGenres, setSelectedGenres] = useState<string[]>(allGenres);
  const [numRecs, setNumRecs] = useState<number>(15);

  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGenre = event.target.value;
    if (selectedGenre === "all") {
      setSelectedGenres(allGenres);
    } else {
      if (selectedGenres.includes(selectedGenre)) {
        setSelectedGenres(selectedGenres.filter(genre => genre !== selectedGenre));
      } else {
        setSelectedGenres([...selectedGenres, selectedGenre]);
      }
    }
  };

	const removeGenre = (genre: string): void => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

	const handleNumRecsChange = (event: React.ChangeEvent<HTMLInputElement>):void => {
    setNumRecs(parseInt(event.target.value));
  };

	const handleGetRecommendations = (): void => {

	};

	return (
		<div className="w-full flex md:flex-row md:justify-evenly flex-col items-start gap-6">
			{/* Add songs section */}
			<div className="w-full mb-3 md:px-4">
				<h2 className="text-lg">01. Select songs:</h2>
				<p className="text-base dark:text-zinc-700">
					- Search and add one or more songs. 
					<br/>
					- Click on song to remove it.
				</p>
				<div className="flex flex-row flex-wrap gap-4 mt-4 w-full">
					{selectedSongs.map(song => {
						return (
						<div 
							key={song.id} onClick={() => {handleSongClick(song)}}
							className="
								flex flex-col py-2 pl-3 pr-3 w-fit rounded-lg text-xs cursor-pointer
							 hover:bg-gray-300 dark:bg-emerald-700 bg-green-200 dark:hover:bg-emerald-700 dark:text-zinc-100"
						>
							<span className="dark:text-zinc-100">{song.name}</span>
							<span className="dark:text-zinc-400 text-zinc-500">{song.artists.join(', ')}</span>
						</div>
						)
					})}
				</div>
			</div>

			{/* Customize recommendations section */}
			<div className="w-full mb-3">
				<h2 className="text-lg">02. Customize:</h2>
				<p className="text-base dark:text-zinc-700">
					- Select genres and number of recommendations
					<br/>
					- Click on a genre to remove it
				</p>
				<div className="flex flex-row flex-wrap gap-5 mt-4 p-5 items-start justify-start border rounded-lg dark:border-zinc-800">
					<div className="w-full flex flex-col">
						<label className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">Select Genres</label>
						<select className="
							flex flex-col w-20 mt-1 mb-3 py-1 px-1 rounded border text-md focus:ring-0 outline-none
							dark:border-zinc-800 dark:bg-zinc-950"
							onChange={handleGenreChange}
              value=""
						>
							<option value=""></option>
							<option value="all">All</option>
							<option value="pop">Pop</option>
							<option value="rap">Rap</option>
							<option value="rock">Rock</option>
							<option value="latin">Latin</option>
							<option value="r&b">R&B</option>
							<option value="edm">Edm</option>
						</select>
						<div className="lg:w-fit flex flex-wrap gap-2 mb-4">
							{selectedGenres.map(genre => {
								let bgColor = '';
								switch (genre) {
									case 'pop': 
										bgColor = 'bg-green-600';			
										break;
									case 'rap':
										bgColor = 'bg-blue-600';
										break;
									case 'rock':
										bgColor = 'bg-red-600';
										break;
									case 'latin':
										bgColor = 'bg-pink-600';
										break;
									case 'r&b':
										bgColor = 'bg-amber-600';
										break;
									case 'edm':
										bgColor = 'bg-violet-600';
										break;
								}
								return (
									<div
										key={genre}
										className={`
											px-3 py-1 rounded-lg text-sm font-medium cursor-pointer
											${bgColor} opacity-90 dark:text-white
										`}
										onClick={() => removeGenre(genre)}
									>
										{genre}
									</div>
								);
							})}
            </div>
					</div>
					
					<div className="lg:w-auto w-full flex flex-col">
            <label className="mb-5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Number of Recommendations: {numRecs}
            </label>
            <input
              type="range"
              min="10"
              max="40"
              step="1"
              value={numRecs}
              onChange={handleNumRecsChange}
              className="slider lg:w-full w-52 h-3 rounded-lg cursor-pointer accent-green-500 dark:bg-zinc-950"
            />
						<div className="lg-full w-52 flex justify-between text-xs text-zinc-500 dark:text-zinc-500 mt-1">
							<span>10</span>
							<span>40</span>
						</div>
          </div>
        </div>

				<div className="flex flex-col sm:items-center mt-10">
					<button 
						onClick={handleGetRecommendations}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none">
						Get Recommendations
					</button>
				</div>
			</div>

			{/* Get recommendations */}
			<div className="w-full mb-3 md:px-4">
				<h2 className="text-lg">03. Your Recommendations:</h2>
				<div className="flex flex-row flex-wrap gap-4 mt-4 mb-3 w-full">
				</div>
			</div>
		</div>
	);
};

export default Display;