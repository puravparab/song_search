import Search from './components/search';

const Home: React.FC = () => {
  return (
    <main 
      className="
        dark:bg-black dark:text-stone-100 bg-stone-200 text-black 
        flex min-h-screen flex-col items-center justify-start 
        py-10 md:px-28 px-5"
    >
      <h1 className="text-2xl text-bold">Song Search</h1>
      <p></p>

      <div className="md:w-6/12 w-10/12 my-6">
        <Search />
      </div>
      
    </main>
  );
}

export default Home;