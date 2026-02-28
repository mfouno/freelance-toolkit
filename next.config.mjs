/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        // Resolve issues with pdfjs-dist importing node modules in the browser
        config.resolve.alias.canvas = false;
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            module: false,
            buffer: false,
            path: false,
        };
        return config;
    },
};

export default nextConfig;
