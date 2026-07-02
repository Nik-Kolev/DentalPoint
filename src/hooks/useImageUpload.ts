'use client';

import { useState } from 'react';

export function useImageUpload<T>(upload: (file: File) => Promise<T>) {
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File): Promise<T> => {
        setUploading(true);
        try {
            return await upload(file);
        } finally {
            setUploading(false);
        }
    };

    return { uploading, handleFile };
}
