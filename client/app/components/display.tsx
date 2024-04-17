interface Song {
  id: string;
  trackId: string;
  name: string;
  artists: string[];
  genre: string;
  subgenre: string;
}

const Display: React.FC<{selectedSongs: Song[], handleSongClick: (song: Song) => void}> = ({ selectedSongs, handleSongClick }) => {
	return (
		<div className="w-full flex flex-col items-start gap-6">
			<div className="w-full">
				<h2 className="text-lg">#1 How it works:</h2>
				<p className="text-base dark:text-zinc-700">Search and add one or more songs. <br></br>Click on song to remove it.</p>
				<div className="mt-4 w-full">
					{selectedSongs.map(song => {
						return (
						<div 
							key={song.id} onClick={() => {handleSongClick(song)}}
							className="py-2 px-3 mb-2 w-fit rounded-lg text-xs hover:bg-gray-300 cursor-pointer dark:bg-emerald-700 bg-green-200 dark:hover:bg-emerald-700 dark:text-zinc-100"
						>
							<span className="mr-4 dark:text-zinc-100">{song.name}</span>
							<span className="dark:text-zinc-400 text-zinc-500">{song.artists.join(', ')}</span>
						</div>
						)
					})}
				</div>
			</div>
			<div>
				<h2 className="text-lg">#2 Adjust your recommendation options:</h2>
			</div>
		</div>
	);
};

export default Display;