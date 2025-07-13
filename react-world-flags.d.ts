// react-world-flags.d.ts
declare module 'react-world-flags' {
    import * as React from 'react';
    interface FlagProps extends React.ImgHTMLAttributes<HTMLImageElement> {
        code: string;
        fallback?: string;
        height?: string | number;
        width?: string | number;
        className?: string;
    }
    const Flag: React.FC<FlagProps>;
    export default Flag;
}
