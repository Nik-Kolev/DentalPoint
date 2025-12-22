'use client';

import { useState, useEffect } from 'react';

export default function ContactMap() {
    const [mapLoaded, setMapLoaded] = useState(false);

    const latitude = 43.221575025798415;
    const longitude = 27.91784662746136;

    // Load map immediately on mount (it's in viewport)
    useEffect(() => {
        // Small delay to allow page to render first, then load map
        const timer = setTimeout(() => {
            setMapLoaded(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className='rounded-lg overflow-hidden shadow-md'>
            {!mapLoaded && (
                <div className='h-[300px] sm:h-[400px] bg-gray-100 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#005baa] mb-2'></div>
                        <p className='text-gray-600 text-sm'>Loading map...</p>
                    </div>
                </div>
            )}
            {mapLoaded && (
                <iframe
                    src={`https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`}
                    width='100%'
                    height='400'
                    className='h-[300px] sm:h-[400px]'
                    style={{ border: 0 }}
                    allowFullScreen
                    loading='eager'
                    referrerPolicy='no-referrer-when-downgrade'
                    title='Dental Point Location'
                />
            )}
        </div>
    );
}
