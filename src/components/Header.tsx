export default function Header() {
  const headerStyle={
    backgroundImage: 'https://img.craiyon.com/2023-11-06/035e2ecc16104f0482987b3a6701f2f111693380.webp',
    backgroundSize: 'cover', // Ajusta el tamaño de la imagen
    backgroundPosition: 'center', // Ajusta la posición de la imagen
  };
  
  return (
    <header style={headerStyle} className='mx-auto w-full bg-gray-800 px-6 pb-16 pt-24 text-center sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-32'>
      <div className='mx-auto max-w-2xl'>
        <h1 className='text-6xl font-bold text-gray-100 sm:text-7xl lg:text-8xl'>
        Prestige Motors
        </h1>
        <p className='mt-4 text-sm leading-8 text-gray-400 sm:mt-6 sm:text-base lg:text-lg'>
          Driving pleasure for every driver
        </p>
      </div>
    </header>
  );
}